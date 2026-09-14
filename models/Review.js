import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
