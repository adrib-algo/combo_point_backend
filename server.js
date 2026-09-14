import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", authRoutes);
app.use("/api", menuRoutes);
app.use("/api", orderRoutes);
app.use("/api", reviewRoutes);
app.use("/api", settingsRoutes);
app.use("/api", businessRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Combo Point Server running on port ${PORT}`);
  
  console.log("Email Service Configuration Status:");
  if (process.env.EMAIL_USER) {
    console.log("  \u2713 EMAIL_USER configured");
  } else {
    console.log("  \u26A0 EMAIL_USER NOT set in .env");
  }

  if (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD) {
    console.log("  \u2713 EMAIL_APP_PASSWORD configured");
  } else {
    console.log("  \u26A0 EMAIL_APP_PASSWORD NOT set in .env");
  }

  if (process.env.ADMIN_EMAIL) {
    console.log("  \u2713 ADMIN_EMAIL configured");
  } else {
    console.log("  \u26A0 ADMIN_EMAIL NOT set in .env");
  }
});
