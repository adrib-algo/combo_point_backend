import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  deliveryAddress: { type: String, required: true },
  landmark: { type: String, required: true },
  pinCode: { type: String, required: true },
  preferredDeliveryTime: { type: String, default: "" },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["NEW", "CONFIRMED", "COMPLETED", "REJECTED"],
    default: "NEW"
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
