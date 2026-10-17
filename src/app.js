import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import clientRoutes from "./routes/clientRoutes.js";
import estimateRoutes from "./routes/estimateRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
const app = express();
// app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(cors({ origin: process.env.FRONTEND_URL || "https://mspaintsquotationmaker.netlify.app/" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is ready",
  });
});
const uploads = path.resolve("uploads/estimates");
fs.mkdirSync(uploads, { recursive: true });
app.use("/uploads/estimates", express.static(uploads));
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "MS Painting Works API is running" }),
);
app.use("/api/clients", clientRoutes);
app.use("/api/estimates", estimateRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
