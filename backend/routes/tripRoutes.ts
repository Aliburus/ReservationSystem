import { Router } from "express";
import {
  getAllTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  importTripsCSV,
  getTripStats,
} from "../controllers/tripController";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = Router();

router.get("/", getAllTrips);
router.post("/", createTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);
router.post("/import-csv", upload.single("file"), importTripsCSV);
router.get("/stats/analytics", getTripStats);

export default router;
