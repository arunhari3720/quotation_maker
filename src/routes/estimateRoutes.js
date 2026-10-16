import { Router } from "express";
import {
  listEstimates,
  getEstimate,
  createEstimate,
  sendEstimate,
} from "../controllers/estimateController.js";
const router = Router();
router.get("/", listEstimates);
router.post("/", createEstimate);
router.get("/:id", getEstimate);
router.post("/:id/send", sendEstimate);
export default router;
