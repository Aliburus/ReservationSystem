import { ObjectId } from "mongodb";

export interface Reservation {
  _id?: ObjectId;
  trip_id: ObjectId;
  seat_number: number;
  first_name: string;
  last_name: string;
  phone: string;
  status?: "active" | "cancelled";
  created_at?: Date;
}
