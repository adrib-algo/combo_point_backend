import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  freeTasteMode: { type: Boolean, default: true },
  deliveryTimeEnabled: { type: Boolean, default: false },
  acceptOrders: { type: Boolean, default: true },
  storeStatus: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
  mainOrderMode: { type: String, enum: ["PRE-ORDER", "INSTANT"], default: "PRE-ORDER" },
  preOrderAdvanceHours: { type: Number, default: 24 },
  minimumPrepHours: { type: Number, default: 1 },
  freeTasteMaxPerPhone: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
