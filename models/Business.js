import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
  bannerUrl: {
    type: String,
    default: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
  },
  aboutText: {
    type: String,
    default: "Combo Point offers delicious, freshly prepared food combos, momos, and quick bites at New Barrackpore. Experience high quality taste with unmatched combo value!"
  },
  physicalLocation: {
    type: String,
    default: "New Barrackpore, near Axis Bank, opposite Monda Mithai Store"
  },
  contactPhone: { type: String, default: "7439709997" },
  contactEmail: { type: String, default: "combopointcafe@gmail.com" },
  socialLinks: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    whatsapp: { type: String, default: "" }
  }
}, { timestamps: true });

export default mongoose.model("Business", businessSchema);
