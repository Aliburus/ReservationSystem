import { ObjectId } from "mongodb";

export interface Trip {
  _id?: ObjectId;
  bus_id: ObjectId;
  from: string;
  to: string;
  date: Date;
  price: number;
  status?: "active" | "cancelled";
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
}
