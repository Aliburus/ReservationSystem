import { Request, Response } from "express";
import { getDB } from "../config/mongo";
import { ObjectId } from "mongodb";
import { Trip } from "../models/trip";
import { parse } from "csv-parse";
import fs from "fs";

export const getAllTrips = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = getDB();
    const trips = await db
      .collection<Trip>("trips")
      .find({ status: { $ne: "cancelled" } })
      .toArray();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Seferler listelenemedi" });
  }
};

export const createTrip = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = getDB();
    const { bus_id, from, to, date, price } = req.body;

    // Zorunlu alan kontrolü
    if (!bus_id || !ObjectId.isValid(bus_id)) {
      res.status(400).json({ error: "Geçersiz otobüs ID" });
      return;
    }

    if (!from || !to || !date || !price) {
      res.status(400).json({ error: "Kalkış, varış, tarih ve fiyat zorunlu" });
      return;
    }

    const trip: Trip = {
      bus_id: new ObjectId(bus_id),
      from,
      to,
      date: new Date(date),
      price: Number(price),
      status: "active",
    };

    const result = await db.collection<Trip>("trips").insertOne(trip);
    res.status(201).json({
      message: "Sefer başarıyla oluşturuldu",
      trip: { ...trip, _id: result.insertedId },
    });
  } catch (error) {
    res.status(500).json({ error: "Sefer oluşturulamadı" });
  }
};

export const updateTrip = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = getDB();
    const { id } = req.params;
    const update = req.body;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Geçersiz sefer ID" });
      return;
    }

    // Tarih güncellemesi varsa Date objesine çevir
    if (update.date) {
      update.date = new Date(update.date);
    }

    await db
      .collection<Trip>("trips")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });
    res.json({ message: "Sefer güncellendi" });
  } catch (error) {
    res.status(500).json({ error: "Sefer güncellenemedi" });
  }
};

export const deleteTrip = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Geçersiz sefer ID" });
      return;
    }

    // Aktif rezervasyon kontrolü
    const hasActiveReservations = await db.collection("reservations").findOne({
      trip_id: new ObjectId(id),
      status: "active",
    });

    if (hasActiveReservations) {
      res
        .status(400)
        .json({ error: "Bu sefere ait aktif rezervasyonlar var, silinemez" });
      return;
    }

    await db.collection<Trip>("trips").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Sefer silindi" });
  } catch (error) {
    res.status(500).json({ error: "Sefer silinemedi" });
  }
};

export const importTripsCSV = async (
  req: Request & { file?: Express.Multer.File },
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "CSV file required" });
    return;
  }
  const db = getDB();
  const trips: Trip[] = [];
  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, trim: true }))
    .on("data", (row: any) => {
      trips.push({
        from: row.from,
        to: row.to,
        date: new Date(row.date),
        price: Number(row.price),
        bus_id: new ObjectId(row.bus_id),
        status: "active",
      });
    })
    .on("end", async () => {
      await db.collection<Trip>("trips").insertMany(trips);
      fs.unlinkSync(req.file!.path);
      res.json({ message: "Trips imported", count: trips.length });
    });
};

export const getTripStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = getDB();
    const stats = await db
      .collection("trips")
      .aggregate([
        {
          $match: { status: "active" },
        },
        {
          $lookup: {
            from: "buses",
            localField: "bus_id",
            foreignField: "_id",
            as: "bus",
          },
        },
        {
          $unwind: "$bus",
        },
        {
          $lookup: {
            from: "reservations",
            localField: "_id",
            foreignField: "trip_id",
            as: "reservations",
          },
        },
        {
          $project: {
            _id: 1,
            from: 1,
            to: 1,
            date: 1,
            price: 1,
            doluluk_orani: {
              $multiply: [
                { $divide: [{ $size: "$reservations" }, "$bus.seat_count"] },
                100,
              ],
            },
            toplam_hasilat: {
              $multiply: [{ $size: "$reservations" }, "$price"],
            },
          },
        },
      ])
      .toArray();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "İstatistikler alınamadı" });
  }
};
