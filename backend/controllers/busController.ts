import { Request, Response } from "express";
import { getDB } from "../config/mongo";
import { ObjectId } from "mongodb";
import { Bus } from "../models/bus";

export const getAllBuses = async (req: Request, res: Response) => {
  const db = getDB();
  const buses = await db.collection<Bus>("buses").find().toArray();
  res.json(buses);
};

export const createBus = async (req: Request, res: Response) => {
  const db = getDB();
  const bus: Bus = req.body;
  const exists = await db
    .collection<Bus>("buses")
    .findOne({ plate: bus.plate });
  if (exists) {
    res.status(400).json({ error: "Bus with this plate already exists." });
    return;
  }
  const result = await db.collection<Bus>("buses").insertOne(bus);
  const created = await db
    .collection<Bus>("buses")
    .findOne({ _id: result.insertedId });
  res.status(201).json(created);
};

export const updateBus = async (req: Request, res: Response) => {
  const db = getDB();
  const id = req.params.id;
  const update = req.body;
  await db
    .collection<Bus>("buses")
    .updateOne({ _id: new ObjectId(id) }, { $set: update });
  res.json({ message: "Bus updated" });
};

export const deleteBus = async (req: Request, res: Response) => {
  const db = getDB();
  const id = req.params.id;
  await db.collection<Bus>("buses").deleteOne({ _id: new ObjectId(id) });
  res.json({ message: "Bus deleted" });
};
