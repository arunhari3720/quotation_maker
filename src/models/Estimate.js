import mongoose from "mongoose";
const itemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    area: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);
const estimateSchema = new mongoose.Schema(
  {
    estimateNumber: { type: String, unique: true, index: true },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    gstRate: { type: Number, default: 0, min: 0, max: 100 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" },
    terms: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "sent", "viewed", "accepted", "rejected"],
      default: "draft",
    },
    pdfUrl: { type: String, default: "" },
    pdfPublicId: { type: String, default: "" },
    emailSentAt: { type: Date, default: null },
  },
  { timestamps: true },
);
export default mongoose.model("Estimate", estimateSchema);
