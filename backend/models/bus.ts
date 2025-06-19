import { ObjectId } from "mongodb";

export interface Bus {
  _id?: ObjectId;
  plate: string;
  seat_count: number;
  seat_plan?: number[][]; // opsiyonel: koltuk planı (ör: 2D dizi)
}
