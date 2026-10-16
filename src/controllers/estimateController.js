import Estimate from "../models/Estimate.js";
import Client from "../models/Client.js";
import { generateEstimatePdf } from "../services/pdfService.js";
import { uploadPdf, removeTempFile } from "../services/cloudinaryService.js";
import { sendEstimateEmail } from "../services/emailService.js";
const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
function validateTotals(body) {
  if (!Array.isArray(body.items) || !body.items.length)
    throw Object.assign(new Error("Add at least one estimate item"), {
      status: 400,
    });
  const items = body.items.map((i) => {
    const area = Number(i.area),
      rate = Number(i.rate);
    if (
      !i.description?.trim() ||
      !Number.isFinite(area) ||
      !Number.isFinite(rate) ||
      area < 0 ||
      rate < 0
    )
      throw Object.assign(
        new Error("Each item needs a description, valid area and valid rate"),
        { status: 400 },
      );
    return {
      description: i.description.trim(),
      area,
      rate,
      amount: round(area * rate),
    };
  });
  const subtotal = round(items.reduce((s, i) => s + i.amount, 0));
  const discountPercent = Math.min(
    100,
    Math.max(0, Number(body.discountPercent) || 0),
  );
  const discountAmount = round((subtotal * discountPercent) / 100);
  const gstRate = Math.min(100, Math.max(0, Number(body.gstRate) || 0));
  const tax = round(((subtotal - discountAmount) * gstRate) / 100);
  return {
    items,
    subtotal,
    discountPercent,
    discountAmount,
    gstRate,
    tax,
    total: round(subtotal - discountAmount + tax),
    notes: body.notes || "",
    terms: body.terms || "",
  };
}
export async function listEstimates(req, res, next) {
  try {
    const filter = req.query.clientId ? { client: req.query.clientId } : {};
    const data = await Estimate.find(filter)
      .populate("client", "name phone email")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
export async function getEstimate(req, res, next) {
  try {
    const data = await Estimate.findById(req.params.id).populate("client");
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Estimate not found" });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
export async function createEstimate(req, res, next) {
  let filePath;
  try {
    const { clientId } = req.body;
    if (!clientId)
      return res
        .status(400)
        .json({ success: false, message: "Choose a client" });
    const client = await Client.findById(clientId);
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    const totals = validateTotals(req.body);
    const estimateNumber = `EST-${Date.now().toString().slice(-8)}`;
    let estimate = await Estimate.create({
      estimateNumber,
      client: client._id,
      ...totals,
    });
    const pdf = await generateEstimatePdf(estimate, client);
    filePath = pdf.filePath;
    let pdfUrl = pdf.publicUrl,
      pdfPublicId = "";
    const uploaded = await uploadPdf(filePath, estimateNumber);
    if (uploaded) {
      pdfUrl = uploaded.url;
      pdfPublicId = uploaded.publicId;
    }
    estimate.pdfUrl = pdfUrl;
    estimate.pdfPublicId = pdfPublicId;
    await estimate.save();
    res
      .status(201)
      .json({ success: true, data: estimate, message: "Estimate saved" });
  } catch (e) {
    next(e);
  }
}
export async function sendEstimate(req, res, next) {
  try {
    const estimate = await Estimate.findById(req.params.id).populate("client");
    if (!estimate)
      return res
        .status(404)
        .json({ success: false, message: "Estimate not found" });
    if (!estimate.client?.email)
      return res
        .status(400)
        .json({
          success: false,
          message: "Add an email address to this client before sending.",
        });
    const pdf = await generateEstimatePdf(estimate, estimate.client);
    const uploaded = await uploadPdf(pdf.filePath, estimate.estimateNumber);
    const pdfUrl = uploaded?.url || pdf.publicUrl;
    await sendEstimateEmail({
      to: estimate.client.email,
      clientName: estimate.client.name,
      estimateNumber: estimate.estimateNumber,
      total: estimate.total,
      pdfPath: pdf.filePath,
      pdfUrl,
    });
    estimate.pdfUrl = pdfUrl;
    if (uploaded) estimate.pdfPublicId = uploaded.publicId;
    estimate.status = "sent";
    estimate.emailSentAt = new Date();
    await estimate.save();
    await removeTempFile(pdf.filePath);
    res.json({ success: true, data: estimate, message: "Estimate email sent" });
  } catch (e) {
    next(e);
  }
}
