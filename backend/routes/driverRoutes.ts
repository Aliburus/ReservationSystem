import { Router } from "express";
import {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getAvailableDrivers,
} from "../controllers/driverController";

const router = Router();

router.get("/", getAllDrivers);
router.post("/", createDriver);
router.put("/:id", updateDriver);
router.delete("/:id", deleteDriver);
router.get("/available", getAvailableDrivers);

export default router;
