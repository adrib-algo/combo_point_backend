import express from "express";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "../controllers/menuController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/menu", getMenuItems);

// Admin
router.post("/admin/menu", protectAdmin, createMenuItem);
router.patch("/admin/menu/:id", protectAdmin, updateMenuItem);
router.delete("/admin/menu/:id", protectAdmin, deleteMenuItem);

export default router;
