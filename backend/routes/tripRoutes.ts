import { Router } from "express";
import {
  getAllTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  importTripsCSV,
  getTripStats,
  updateTripDrivers,
  updateTripsBulkPrice,
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
router.put("/:id/drivers", updateTripDrivers);
router.post("/bulk-update-price", updateTripsBulkPrice);

export default router;
