import Order from "../models/Order.js";

export const generateNextOrderId = async () => {
  const latestOrder = await Order.findOne({}, {}, { sort: { createdAt: -1 } });

  if (!latestOrder || !latestOrder.orderNumber) {
    return "CP-001";
  }

  const matches = latestOrder.orderNumber.match(/^CP-(\d+)$/);
  if (matches && matches[1]) {
    const nextNum = parseInt(matches[1], 10) + 1;
    return `CP-${String(nextNum).padStart(3, "0")}`;
  }

  const count = await Order.countDocuments();
  return `CP-${String(count + 1).padStart(3, "0")}`;
};
