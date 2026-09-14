import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Settings from "../models/Settings.js";
import { generateNextOrderId } from "../utils/generateOrderId.js";
import { sendCustomerOrderReceiptEmail, sendAdminNewOrderAlertEmail, sendCustomerOrderConfirmationEmail } from "../services/emailService.js";

export const createOrder = async (req, res) => {
  try {
    // 1. Fetch store settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (!settings.acceptOrders || settings.storeStatus === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Orders are currently closed. Please try again later."
      });
    }

    const { customerName, phone, email, deliveryAddress, landmark, pinCode, preferredDeliveryTime, items } = req.body;

    // 2. Validate customer fields
    if (!customerName || !phone || !email || !deliveryAddress || !landmark || !pinCode) {
      return res.status(400).json({ success: false, message: "Please fill in all required customer details." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty." });
    }

    // 3. Authoritative server price verification & availability check
    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const cartItem of items) {
      const dbItem = await MenuItem.findById(cartItem.menuItemId);
      if (!dbItem) {
        return res.status(400).json({ success: false, message: `Menu item not found: ${cartItem.name || cartItem.menuItemId}` });
      }

      if (!dbItem.isAvailable) {
        return res.status(400).json({ success: false, message: `Sorry, "${dbItem.name}" is currently unavailable.` });
      }

      const qty = Math.max(1, parseInt(cartItem.quantity, 10) || 1);
      const itemTotal = dbItem.price * qty;
      calculatedTotal += itemTotal;

      verifiedItems.push({
        menuItemId: dbItem._id,
        name: dbItem.name,
        quantity: qty,
        price: dbItem.price
      });
    }

    // 4. Generate Order ID
    const orderNumber = await generateNextOrderId();

    // 5. Create Order document
    const order = new Order({
      orderNumber,
      customerName,
      phone,
      email,
      deliveryAddress,
      landmark,
      pinCode,
      preferredDeliveryTime: settings.deliveryTimeEnabled ? (preferredDeliveryTime || "") : "",
      items: verifiedItems,
      totalAmount: calculatedTotal,
      status: "NEW"
    });

    const savedOrder = await order.save();

    // 6. Send Email Notifications asynchronously
    sendCustomerOrderReceiptEmail(savedOrder);
    sendAdminNewOrderAlertEmail(savedOrder);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      orderNumber: savedOrder.orderNumber,
      order: savedOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["NEW", "CONFIRMED", "COMPLETED", "REJECTED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status transition" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const previousStatus = order.status;
    order.status = status;
    const updatedOrder = await order.save();

    // Send confirmation email if transitioning to CONFIRMED
    if (status === "CONFIRMED" && previousStatus !== "CONFIRMED") {
      sendCustomerOrderConfirmationEmail(updatedOrder);
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
