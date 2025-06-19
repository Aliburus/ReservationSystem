import { Router } from "express";
import {
  getAllBuses,
  createBus,
  updateBus,
  deleteBus,
} from "../controllers/busController";

const router = Router();

router.get("/", getAllBuses);
router.post("/", createBus);
router.put("/:id", updateBus);
router.delete("/:id", deleteBus);

export default router;
