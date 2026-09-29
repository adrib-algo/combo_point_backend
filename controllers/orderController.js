import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Settings from "../models/Settings.js";
import { generateNextToken } from "../utils/generateToken.js";
import { sendCustomerOrderReceiptEmail, sendAdminNewOrderAlertEmail, sendCustomerOrderConfirmationEmail } from "../services/emailService.js";

// Helper: Check duplicate order within 10 seconds for same phone
const checkDuplicateOrder = async (phone) => {
  const recent = await Order.findOne({
    phone,
    createdAt: { $gte: new Date(Date.now() - 10000) }
  });
  return !!recent;
};

// Robust Date/Time Parser for Pre-Orders
const parseDeliveryDateTime = (dateStr, timeStr) => {
  if (!dateStr) return new Date();
  
  let hours = 12;
  let minutes = 0;

  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      hours = h;
      minutes = m;
    }
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  if (year && month && day) {
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  return new Date(dateStr);
};

// 1. Create Main Order (PRE-ORDER or INSTANT)
export const createOrder = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    if (!settings.acceptOrders || settings.storeStatus === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Orders are currently closed. Please try again later."
      });
    }

    const { customerName, phone, email, deliveryAddress, landmark, pinCode, deliveryDate, deliveryTime, items } = req.body;

    if (!customerName || !phone || !deliveryAddress) {
      return res.status(400).json({ success: false, message: "Please fill in all required customer details." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty." });
    }

    // Check duplicate submission
    if (await checkDuplicateOrder(phone)) {
      return res.status(400).json({ success: false, message: "Duplicate order submission detected. Please wait a moment." });
    }

    // Validate Pre-Order Deadline if in PRE-ORDER mode
    const mode = settings.mainOrderMode || "PRE-ORDER";
    if (mode === "PRE-ORDER") {
      if (!deliveryDate || !deliveryTime) {
        return res.status(400).json({ success: false, message: "Please select a required delivery date and time for your Pre-Order." });
      }

      const requestedDeliveryDate = parseDeliveryDateTime(deliveryDate, deliveryTime);
      const now = new Date();
      const advanceMs = (settings.preOrderAdvanceHours || 24) * 3600 * 1000;
      const earliestAllowed = new Date(now.getTime() + advanceMs);

      if (requestedDeliveryDate < earliestAllowed) {
        return res.status(400).json({
          success: false,
          code: "PREORDER_DEADLINE_EXCEEDED",
          message: "Order cannot be placed for this delivery time. You will receive the order after tomorrow."
        });
      }
    }

    // Verify item prices & availability
    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const cartItem of items) {
      const dbItem = await MenuItem.findById(cartItem.menuItemId);
      if (!dbItem) {
        return res.status(400).json({ success: false, message: "Menu item not found: " + (cartItem.name || cartItem.menuItemId) });
      }

      if (!dbItem.isAvailable) {
        return res.status(400).json({ success: false, message: 'Sorry, "' + dbItem.name + '" is currently unavailable.' });
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

    // Generate atomic token
    const tokenNumber = await generateNextToken();
    const orderNumber = "#" + tokenNumber;

    const order = new Order({
      tokenNumber,
      orderNumber,
      orderType: "MAIN",
      mainOrderSubMode: mode,
      customerName,
      phone,
      email: email || "",
      deliveryAddress,
      landmark: landmark || "",
      pinCode: pinCode || "",
      deliveryDate: deliveryDate || "",
      deliveryTime: deliveryTime || "",
      preferredDeliveryTime: deliveryTime || "",
      items: verifiedItems,
      totalAmount: calculatedTotal,
      status: "PENDING"
    });

    const savedOrder = await order.save();

    if (savedOrder.email) {
      sendCustomerOrderReceiptEmail(savedOrder);
    }
    sendAdminNewOrderAlertEmail(savedOrder);

    return res.status(201).json({
      success: true,
      message: "Main Order placed successfully!",
      tokenNumber: savedOrder.tokenNumber,
      orderNumber: savedOrder.orderNumber,
      order: savedOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create Free Taste Order
export const createFreeTasteOrder = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    if (!settings.freeTasteMode) {
      return res.status(400).json({ success: false, message: "Free Taste campaign is currently disabled by Admin." });
    }

    const { customerName, phone, deliveryAddress, menuItemId } = req.body;

    if (!customerName || !phone || !deliveryAddress || !menuItemId) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields (Name, Phone, Address, Item)." });
    }

    // Free Taste Abuse Protection: Check existing requests by phone
    const maxAllowed = settings.freeTasteMaxPerPhone || 1;
    const existingCount = await Order.countDocuments({ phone, orderType: "FREE_TASTE" });
    if (existingCount >= maxAllowed) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a Free Taste request with this contact number (' + phone + ').'
      });
    }

    const dbItem = await MenuItem.findById(menuItemId);
    if (!dbItem || !dbItem.isAvailable) {
      return res.status(400).json({ success: false, message: "Selected Free Taste item is unavailable." });
    }

    // Atomic token number
    const tokenNumber = await generateNextToken();
    const orderNumber = "#" + tokenNumber;

    const freeTasteOrder = new Order({
      tokenNumber,
      orderNumber,
      orderType: "FREE_TASTE",
      customerName,
      phone,
      deliveryAddress,
      items: [{
        menuItemId: dbItem._id,
        name: dbItem.name,
        quantity: 1,
        price: 0
      }],
      totalAmount: 0,
      status: "PENDING"
    });

    const savedOrder = await freeTasteOrder.save();

    sendAdminNewOrderAlertEmail(savedOrder);

    return res.status(201).json({
      success: true,
      message: "Free Taste request placed successfully!",
      tokenNumber: savedOrder.tokenNumber,
      orderNumber: savedOrder.orderNumber,
      order: savedOrder
    });
  } catch (error) {
    console.error("Error creating Free Taste order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Verify Token Endpoint
export const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    let cleanTokenStr = token.trim().replace(/^#/, "");
    const tokenNum = parseInt(cleanTokenStr, 10);

    let order = null;
    if (!isNaN(tokenNum)) {
      order = await Order.findOne({ tokenNumber: tokenNum });
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: token.trim() });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Invalid token number." });
    }

    return res.json({
      success: true,
      order: {
        tokenNumber: order.tokenNumber,
        tokenString: "#" + order.tokenNumber,
        customerName: order.customerName,
        phone: order.phone,
        address: order.deliveryAddress,
        orderType: order.orderType === "FREE_TASTE" ? "Free Taste" : ("Main Order (" + (order.mainOrderSubMode || "Standard") + ")"),
        items: order.items.map(i => i.name + " × " + i.quantity).join(", "),
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Admin Get Main Orders (Includes legacy and newly typed main orders)
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ orderType: "MAIN" }, { orderType: { $exists: false } }, { orderType: null }, { orderType: "" }]
    }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Admin Get Free Taste Requests
export const getAdminFreeTasteRequests = async (req, res) => {
  try {
    const requests = await Order.find({ orderType: "FREE_TASTE" }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Admin Get Order By ID
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

// 7. Update Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      "PENDING", "ACCEPTED", "PREPARING", "READY", "OUT FOR DELIVERY", "DELIVERED",
      "CONTACTED", "APPROVED", "CANCELLED", "NEW", "CONFIRMED", "COMPLETED", "REJECTED"
    ];
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

    if ((status === "ACCEPTED" || status === "CONFIRMED" || status === "APPROVED") && previousStatus !== status) {
      if (updatedOrder.email) {
        sendCustomerOrderConfirmationEmail(updatedOrder);
      }
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
