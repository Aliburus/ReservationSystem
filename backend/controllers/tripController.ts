import { Request, Response } from "express";
import { getDB } from "../config/mongo";
import { ObjectId } from "mongodb";
import { Trip } from "../models/trip";
import { parse } from "csv-parse";
import fs from "fs";
import crypto from "crypto";

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
    const {
      bus_id,
      from,
      to,
      date,
      price,
      departureTime,
      arrivalTime,
      duration,
    } = req.body;

    // Zorunlu alan kontrolü
    if (!bus_id || !ObjectId.isValid(bus_id)) {
      res.status(400).json({ error: "Geçersiz otobüs ID" });
      return;
    }

    if (!from || !to || !date || !price || !departureTime || !arrivalTime) {
      res.status(400).json({
        error:
          "Kalkış, varış, tarih, fiyat, kalkış saati ve varış saati zorunlu",
      });
      return;
    }

    // Tarih bugünden önce olamaz
    const now = new Date();
    const tripDate = new Date(date);
    if (tripDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      res.status(400).json({ error: "Tarih bugünden önce olamaz" });
      return;
    }

    // Kalkış saati varıştan sonra olamaz (gün değişimi dahil)
    const [depHour, depMin] = departureTime.split(":").map(Number);
    const [arrHour, arrMin] = arrivalTime.split(":").map(Number);
    let depTotal = depHour * 60 + depMin;
    let arrTotal = arrHour * 60 + arrMin;
    // Eğer varış saati kalkıştan küçükse, ertesi gün varış varsayılır
    if (arrTotal <= depTotal) arrTotal += 24 * 60;
    if (arrTotal - depTotal <= 0) {
      res.status(400).json({ error: "Varış saati kalkıştan sonra olmalı" });
      return;
    }

    // Aynı otobüs aynı gün birden fazla sefere atanamaz
    const startOfDay = new Date(
      tripDate.getFullYear(),
      tripDate.getMonth(),
      tripDate.getDate()
    );
    const endOfDay = new Date(
      tripDate.getFullYear(),
      tripDate.getMonth(),
      tripDate.getDate() + 1
    );
    const busTripExists = await db.collection<Trip>("trips").findOne({
      bus_id: new ObjectId(bus_id),
      date: { $gte: startOfDay, $lt: endOfDay },
      status: { $ne: "cancelled" },
    });
    if (busTripExists) {
      res
        .status(400)
        .json({ error: "Bu otobüs bu tarihte başka bir sefere atanmış" });
      return;
    }

    // Otobüse atanmış şoförleri bul
    const assignedDrivers = await db
      .collection("drivers")
      .find({ assignedBus: new ObjectId(bus_id) })
      .toArray();
    const driverIds = assignedDrivers.map((d: any) => d._id);

    const randomTripId = () =>
      crypto.randomBytes(4).toString("hex").toUpperCase();

    const trip: Trip = {
      ...req.body,
      bus_id: new ObjectId(bus_id),
      from,
      to,
      date: new Date(date),
      price: Number(price),
      departureTime,
      arrivalTime,
      duration,
      status: "active",
      trip_id: "", // geçici, aşağıda set edilecek
      drivers: driverIds,
    };

    const result = await db.collection<Trip>("trips").insertOne(trip);
    // trip_id'yi benzersiz random olarak güncelle
    const tripIdStr = randomTripId();
    await db
      .collection<Trip>("trips")
      .updateOne({ _id: result.insertedId }, { $set: { trip_id: tripIdStr } });

    res.status(201).json({
      message: "Sefer başarıyla oluşturuldu",
      trip: {
        ...trip,
        _id: result.insertedId,
        trip_id: tripIdStr,
      },
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

    // Validasyonlar (tarih, saat, otobüs)
    if (update.date) {
      const now = new Date();
      if (
        update.date < new Date(now.getFullYear(), now.getMonth(), now.getDate())
      ) {
        res.status(400).json({ error: "Tarih bugünden önce olamaz" });
        return;
      }
    }
    if (update.departureTime && update.arrivalTime) {
      const [depHour, depMin] = update.departureTime.split(":").map(Number);
      const [arrHour, arrMin] = update.arrivalTime.split(":").map(Number);
      let depTotal = depHour * 60 + depMin;
      let arrTotal = arrHour * 60 + arrMin;
      if (arrTotal <= depTotal) arrTotal += 24 * 60;
      if (arrTotal - depTotal <= 0) {
        res.status(400).json({ error: "Varış saati kalkıştan sonra olmalı" });
        return;
      }
    }
    if (update.bus_id && update.date) {
      const startOfDay = new Date(
        update.date.getFullYear(),
        update.date.getMonth(),
        update.date.getDate()
      );
      const endOfDay = new Date(
        update.date.getFullYear(),
        update.date.getMonth(),
        update.date.getDate() + 1
      );
      const tripsSameDay = await db
        .collection<Trip>("trips")
        .find({
          bus_id: new ObjectId(update.bus_id),
          date: { $gte: startOfDay, $lt: endOfDay },
          status: { $ne: "cancelled" },
          _id: { $ne: new ObjectId(id) },
        })
        .toArray();
      tripsSameDay.push({
        _id: new ObjectId(),
        from: update.from,
        to: update.to,
        departureTime: update.departureTime,
        arrivalTime: update.arrivalTime,
        bus_id: new ObjectId(update.bus_id),
        date: update.date,
        price: update.price || 0,
        status: "active",
        duration: update.duration || "",
        trip_id: "",
      });
      if (tripsSameDay.length > 0) {
        tripsSameDay.sort((a, b) => {
          const [aH, aM] = (a.departureTime || "00:00").split(":").map(Number);
          const [bH, bM] = (b.departureTime || "00:00").split(":").map(Number);
          return aH * 60 + aM - (bH * 60 + bM);
        });
        const lastTrip = tripsSameDay[tripsSameDay.length - 1];
        if (lastTrip.to !== update.from) {
          res.status(400).json({
            error:
              "Otobüsün yeni seferi, zincirin son varış noktasından başlamalı.",
          });
          return;
        }
        const [lastArrHour, lastArrMin] = (lastTrip.arrivalTime || "00:00")
          .split(":")
          .map(Number);
        const [currDepHour, currDepMin] = (update.departureTime || "00:00")
          .split(":")
          .map(Number);
        let lastArrTotal = lastArrHour * 60 + lastArrMin;
        let currDepTotal = currDepHour * 60 + currDepMin;
        if (currDepTotal <= lastArrTotal) currDepTotal += 24 * 60;
        if (currDepTotal - lastArrTotal < 360) {
          res.status(400).json({
            error:
              "Otobüsün yeni seferi, zincirin son varıştan en az 6 saat sonra olmalı.",
          });
          return;
        }
      }
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

    // Sefer silinmeden önce tüm rezervasyonları sil
    await db
      .collection("reservations")
      .deleteMany({ trip_id: new ObjectId(id) });

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
        departureTime: row.departureTime,
        arrivalTime: row.arrivalTime,
        duration: row.duration,
        status: "active",
        trip_id: "",
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
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$reservations",
                      as: "r",
                      cond: { $eq: ["$$r.status", "active"] },
                    },
                  },
                  as: "r",
                  in: { $ifNull: ["$$r.price", 0] },
                },
              },
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

export const updateTripDrivers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { drivers } = req.body;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Geçersiz sefer ID" });
      return;
    }
    await db.collection<Trip>("trips").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          drivers: (drivers || []).map((d: string) => new ObjectId(d)),
        },
      }
    );
    res.json({ message: "Şoförler güncellendi" });
  } catch (error) {
    res.status(500).json({ error: "Şoförler güncellenemedi" });
  }
};

export const updateTripsBulkPrice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = getDB();
    const { startDate, endDate, type, value, from, to, all } = req.body;
    if (!type || value === undefined) {
      res.status(400).json({ error: "Güncelleme türü ve değer zorunlu." });
      return;
    }
    let filter: any = { status: { $ne: "cancelled" as any } };
    if (!all) {
      if (!startDate || !endDate) {
        res.status(400).json({ error: "Tarih aralığı seçmelisiniz." });
        return;
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ error: "Geçerli bir tarih aralığı girin." });
        return;
      }
      filter.date = { $gte: start, $lte: end };
      if (from) filter.from = from;
      if (to) filter.to = to;
    }
    let update: any = {};
    if (type === "percent") {
      update = { $mul: { price: 1 + value / 100 } };
    } else if (type === "add") {
      update = { $inc: { price: value } };
    } else if (type === "set") {
      update = { $set: { price: value } };
    } else {
      res.status(400).json({ error: "Geçersiz güncelleme tipi." });
      return;
    }
    const result = await db
      .collection<Trip>("trips")
      .updateMany(filter, update);
    if (result.modifiedCount === 0) {
      res.status(400).json({
        error: "Seçilen kriterlere uygun güncellenecek sefer bulunamadı.",
      });
      return;
    }
    res.json({ message: `Toplam ${result.modifiedCount} sefer güncellendi.` });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Toplu fiyat güncellenemedi. Lütfen tekrar deneyin." });
  }
};
