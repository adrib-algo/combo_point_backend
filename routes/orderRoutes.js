import express from "express";
import { createOrder, getAdminOrders, getAdminOrderById, updateOrderStatus } from "../controllers/orderController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/orders", createOrder);

// Admin
router.get("/admin/orders", protectAdmin, getAdminOrders);
router.get("/admin/orders/:id", protectAdmin, getAdminOrderById);
router.patch("/admin/orders/:id/status", protectAdmin, updateOrderStatus);

export default router;
