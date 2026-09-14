import express from "express";
import { getApprovedReviews, submitReview, getAdminReviews, updateReview } from "../controllers/reviewController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/reviews", getApprovedReviews);
router.post("/reviews", submitReview);

// Admin
router.get("/admin/reviews", protectAdmin, getAdminReviews);
router.patch("/admin/reviews/:id", protectAdmin, updateReview);

export default router;
