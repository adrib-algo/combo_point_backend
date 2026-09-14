import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/settings", getSettings);

// Admin
router.get("/admin/settings", protectAdmin, getSettings);
router.patch("/admin/settings", protectAdmin, updateSettings);

export default router;
