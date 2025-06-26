import { Request, Response } from "express";
import { getDB } from "../config/mongo";
import { ObjectId } from "mongodb";
import { Driver } from "../models/driver";

export const getAllDrivers = async (req: Request, res: Response) => {
  const db = getDB();
  const drivers = await db.collection<Driver>("drivers").find().toArray();
  res.json(drivers);
};

export const createDriver = async (req: Request, res: Response) => {
  const db = getDB();
  const { name, phone, assignedBus } = req.body;
  const driver: Driver = {
    name,
    phone,
    assignedBus: assignedBus ? new ObjectId(assignedBus) : null,
  };
  const result = await db.collection<Driver>("drivers").insertOne(driver);
  res.status(201).json({ ...driver, _id: result.insertedId });
};

export const updateDriver = async (req: Request, res: Response) => {
  const db = getDB();
  const { id } = req.params;
  const { name, phone, assignedBus } = req.body;
  await db.collection<Driver>("drivers").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        name,
        phone,
        assignedBus: assignedBus ? new ObjectId(assignedBus) : null,
      },
    }
  );
  res.json({ message: "Şoför güncellendi" });
};

export const deleteDriver = async (req: Request, res: Response) => {
  const db = getDB();
  const { id } = req.params;
  await db.collection<Driver>("drivers").deleteOne({ _id: new ObjectId(id) });
  res.json({ message: "Şoför silindi" });
};

export const getAvailableDrivers = async (req: Request, res: Response) => {
  const db = getDB();
  const drivers = await db
    .collection<Driver>("drivers")
    .find({ assignedBus: null })
    .toArray();
  res.json(drivers);
};
