import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  freeTasteMode: { type: Boolean, default: true },
  deliveryTimeEnabled: { type: Boolean, default: false },
  acceptOrders: { type: Boolean, default: true },
  storeStatus: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" }
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
