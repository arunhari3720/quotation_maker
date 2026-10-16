import fs from "node:fs/promises";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
export async function uploadPdf(filePath, publicId) {
  if (!isCloudinaryConfigured()) return null;
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "ms-painting/estimates",
    public_id: publicId,
    format: "pdf",
    overwrite: true,
  });
  return { url: result.secure_url, publicId: result.public_id };
}
export async function uploadClientPhoto(filePath, publicId) {
  if (!isCloudinaryConfigured())
    throw new Error("Configure Cloudinary to upload client photos.");
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "image",
    folder: "ms-painting/clients",
    public_id: publicId,
  });
  return { url: result.secure_url, publicId: result.public_id };
}
export async function removeTempFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {}
}
