import { Router } from "express";
import {
  listEstimates,
  getEstimate,
  createEstimate,
  sendEstimate,
  updateEstimate,
  deleteEstimate
} from "../controllers/estimateController.js";
const router = Router();
router.get("/", listEstimates);
router.post("/", createEstimate);
router.get("/:id", getEstimate);
router.post("/:id/send", sendEstimate);
router.put("/:id", updateEstimate);
router.delete("/:id", deleteEstimate);
export default router;
