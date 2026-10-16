import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  uploadPhoto,
} from "../controllers/clientController.js";
const router = Router();
const uploadDir = path.resolve("uploads/tmp");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype)),
});
router.get("/", listClients);
router.post("/", createClient);
router.get("/:id", getClient);
router.patch("/:id", updateClient);
router.delete("/:id", deleteClient);
router.post("/:id/photo", upload.single("photo"), uploadPhoto);
export default router;
