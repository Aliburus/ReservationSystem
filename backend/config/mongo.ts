import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGO_URI || "";

let client: MongoClient;
let db: Db;

export const connectDB = async () => {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  console.log("MongoDB connected");
  return db;
};

export const getDB = () => db;
