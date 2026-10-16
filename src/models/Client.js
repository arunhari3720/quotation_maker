import mongoose from "mongoose";
const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    address: { type: String, trim: true, default: "" },
    propertyType: {
      type: String,
      enum: ["House", "Apartment", "Commercial", "Other"],
      default: "House",
    },
    areaSqft: { type: Number, default: 0, min: 0 },
    photoUrl: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },
  },
  { timestamps: true },
);
clientSchema.index({ name: 1 });
clientSchema.index({ phone: 1 });
export default mongoose.model("Client", clientSchema);
