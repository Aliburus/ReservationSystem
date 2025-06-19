import { Request, Response } from "express";
import { getDB } from "../config/mongo";
import { ObjectId } from "mongodb";
import { Reservation } from "../models/reservation";

export const getAllReservations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const db = getDB();
  const reservations = await db
    .collection<Reservation>("reservations")
    .find()
    .toArray();
  res.json(reservations);
};

export const createReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const db = getDB();
  const { trip_id, seat_number, first_name, last_name, phone } = req.body;

  // Zorunlu alanları kontrol et
  if (!trip_id || !ObjectId.isValid(trip_id)) {
    res.status(400).json({ error: "Geçersiz sefer ID" });
    return;
  }

  if (!seat_number) {
    res.status(400).json({ error: "Koltuk numarası zorunlu" });
    return;
  }

  if (!first_name || !last_name || !phone) {
    res.status(400).json({ error: "Ad, soyad ve telefon zorunlu" });
    return;
  }

  try {
    // Koltuk müsait mi kontrol et
    const existingReservation = await db
      .collection<Reservation>("reservations")
      .findOne({
        trip_id: new ObjectId(trip_id),
        seat_number: seat_number,
        status: "active",
      });

    if (existingReservation) {
      res.status(400).json({ error: "Bu koltuk dolu" });
      return;
    }

    // Yeni rezervasyon oluştur
    const reservation: Reservation = {
      trip_id: new ObjectId(trip_id),
      seat_number,
      first_name,
      last_name,
      phone,
      status: "active",
      created_at: new Date(),
    };

    const result = await db
      .collection<Reservation>("reservations")
      .insertOne(reservation);

    res.status(201).json({
      message: "Rezervasyon başarıyla oluşturuldu",
      reservation: { ...reservation, _id: result.insertedId },
    });
  } catch (error) {
    res.status(500).json({ error: "Rezervasyon oluşturulamadı" });
  }
};

export const updateReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const db = getDB();
  const { id } = req.params;
  const update = req.body;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "Geçersiz rezervasyon ID" });
    return;
  }

  await db
    .collection<Reservation>("reservations")
    .updateOne({ _id: new ObjectId(id) }, { $set: update });
  res.json({ message: "Rezervasyon güncellendi" });
};

export const deleteReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const db = getDB();
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "Geçersiz rezervasyon ID" });
    return;
  }

  await db
    .collection<Reservation>("reservations")
    .deleteOne({ _id: new ObjectId(id) });
  res.json({ message: "Rezervasyon silindi" });
};
