import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
});

const orderSchema = new mongoose.Schema({
  tokenNumber: { type: Number, required: true, unique: true },
  orderNumber: { type: String, required: true, unique: true },
  orderType: { type: String, enum: ["MAIN", "FREE_TASTE"], default: "MAIN" },
  mainOrderSubMode: { type: String, enum: ["PRE-ORDER", "INSTANT"], default: "PRE-ORDER" },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, default: "", trim: true, lowercase: true },
  deliveryAddress: { type: String, required: true },
  landmark: { type: String, default: "" },
  pinCode: { type: String, default: "" },
  deliveryDate: { type: String, default: "" },
  deliveryTime: { type: String, default: "" },
  preferredDeliveryTime: { type: String, default: "" },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "PREPARING", "READY", "OUT FOR DELIVERY", "DELIVERED", "CONTACTED", "APPROVED", "CANCELLED", "NEW", "CONFIRMED", "COMPLETED", "REJECTED"],
    default: "PENDING"
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
