import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { connectDB } from "./config/mongo";
import tripRoutes from "./routes/tripRoutes";
import reservationRoutes from "./routes/reservationRoutes";
import busRoutes from "./routes/busRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/trips", tripRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Bus Company Reservation System Backend (MongoDB + TypeScript)");
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
