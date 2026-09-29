import express from "express";
import {
  createOrder,
  createFreeTasteOrder,
  verifyToken,
  getAdminOrders,
  getAdminFreeTasteRequests,
  getAdminOrderById,
  updateOrderStatus
} from "../controllers/orderController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/orders", createOrder);
router.post("/orders/free-taste", createFreeTasteOrder);
router.get("/orders/verify-token/:token", verifyToken);

// Admin Routes
router.get("/admin/orders", protectAdmin, getAdminOrders);
router.get("/admin/free-taste", protectAdmin, getAdminFreeTasteRequests);
router.get("/admin/orders/:id", protectAdmin, getAdminOrderById);
router.patch("/admin/orders/:id/status", protectAdmin, updateOrderStatus);

export default router;
