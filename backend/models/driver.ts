import { ObjectId } from "mongodb";

export interface Driver {
  _id?: ObjectId;
  name: string;
  phone: string;
  assignedBus?: ObjectId | null;
}
