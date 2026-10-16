import Client from "../models/Client.js";
import Estimate from "../models/Estimate.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import {
  uploadClientPhoto,
  removeTempFile,
} from "../services/cloudinaryService.js";
export async function listClients(req, res, next) {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const data = await Client.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
export async function getClient(req, res, next) {
  try {
    const client = await Client.findById(req.params.id).lean();
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    client.estimates = await Estimate.find({ client: client._id })
      .sort({ createdAt: -1 })
      .select("estimateNumber total status pdfUrl createdAt")
      .lean();
    res.json({ success: true, data: client });
  } catch (e) {
    next(e);
  }
}
export async function createClient(req, res, next) {
  try {
    const { name, phone, email, address, propertyType, areaSqft } = req.body;
    if (!name || !phone)
      return res
        .status(400)
        .json({
          success: false,
          message: "Client name and phone are required",
        });
    const data = await Client.create({
      name,
      phone,
      email,
      address,
      propertyType,
      areaSqft,
    });
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
export async function updateClient(req, res, next) {
  try {
    const data = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
export async function deleteClient(req, res, next) {
  try {
    const hasEstimates = await Estimate.exists({ client: req.params.id });
    if (hasEstimates)
      return res
        .status(409)
        .json({
          success: false,
          message: "This client has saved estimates and cannot be deleted.",
        });
    const data = await Client.findByIdAndDelete(req.params.id);
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    res.json({ success: true, message: "Client deleted" });
  } catch (e) {
    next(e);
  }
}
export async function uploadPhoto(req, res, next) {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Choose an image to upload" });
    if (!isCloudinaryConfigured()) {
      await removeTempFile(req.file.path);
      return res
        .status(503)
        .json({ success: false, message: "Cloudinary is not configured" });
    }
    const result = await uploadClientPhoto(
      req.file.path,
      `client-${req.params.id}-${Date.now()}`,
    );
    await removeTempFile(req.file.path);
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { photoUrl: result.url, photoPublicId: result.publicId },
      { new: true },
    );
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    res.json({ success: true, data: client });
  } catch (e) {
    if (req.file) await removeTempFile(req.file.path);
    next(e);
  }
}
