import express from "express";
import { getBusiness, updateBusiness } from "../controllers/businessController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/business", getBusiness);

// Admin
router.get("/admin/business", protectAdmin, getBusiness);
router.patch("/admin/business", protectAdmin, updateBusiness);

export default router;
