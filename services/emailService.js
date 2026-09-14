import nodemailer from "nodemailer";

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT) || 587;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    });
  }
  return null;
};

export const sendCustomerOrderReceiptEmail = async (order) => {
  const transporter = createTransporter();
  const itemsList = order.items.map((i) => `${i.name} × ${i.quantity} (₹${i.price})`).join("\n");
  const textContent = `Hello ${order.customerName},

Your Combo Point order ${order.orderNumber} has been received successfully.

Items:
${itemsList}

Total: ₹${order.totalAmount}

Delivery Address:
${order.deliveryAddress}, ${order.landmark}, PIN: ${order.pinCode}

We will confirm your order shortly.

Thank you for choosing Combo Point.`;

  if (!transporter) {
    console.log("[EMAIL SERVICE LOG - CUSTOMER RECEIPT]\n" + textContent);
    return;
  }

  try {
    const fromAddr = process.env.EMAIL_FROM || (`"Combo Point" <` + process.env.EMAIL_USER + `>`);
    await transporter.sendMail({
      from: fromAddr,
      to: order.email,
      subject: `Combo Point \u2014 Order Received \u2014 ${order.orderNumber}`,
      text: textContent
    });
    console.log(`[EMAIL SENT] Customer receipt sent to ${order.email} for order ${order.orderNumber}`);
  } catch (err) {
    console.error(`Customer email delivery error for order ${order.orderNumber}:`, err.message);
  }
};

export const sendAdminNewOrderAlertEmail = async (order) => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const itemsList = order.items.map((i) => `${i.name} × ${i.quantity} (₹${i.price})`).join("\n");
  const textContent = `New Order Arrived

Order ID: ${order.orderNumber}

Customer:
${order.customerName}

Phone:
${order.phone}

Email:
${order.email}

Delivery Address:
${order.deliveryAddress}, ${order.landmark}, PIN: ${order.pinCode}

Items:
${itemsList}

Total:
₹${order.totalAmount}

Status:
${order.status}

Please check the Combo Point admin dashboard.`;

  if (!transporter || !adminEmail) {
    console.log("[EMAIL SERVICE LOG - ADMIN NEW ORDER ALERT]\n" + textContent);
    return;
  }

  try {
    const fromAddr = process.env.EMAIL_FROM || (`"Combo Point System" <` + process.env.EMAIL_USER + `>`);
    await transporter.sendMail({
      from: fromAddr,
      to: adminEmail,
      subject: `\uD83D\uDD14 New Order Arrived \u2014 ${order.orderNumber}`,
      text: textContent
    });
    console.log(`[EMAIL SENT] Admin alert sent to ${adminEmail} for order ${order.orderNumber}`);
  } catch (err) {
    console.error(`Admin alert email delivery error for order ${order.orderNumber}:`, err.message);
  }
};

export const sendCustomerOrderConfirmationEmail = async (order) => {
  const transporter = createTransporter();
  const textContent = `Hello ${order.customerName},

Your Combo Point order ${order.orderNumber} has been confirmed.

We are processing your order.

Thank you for choosing Combo Point!`;

  if (!transporter) {
    console.log("[EMAIL SERVICE LOG - CUSTOMER CONFIRMATION]\n" + textContent);
    return;
  }

  try {
    const fromAddr = process.env.EMAIL_FROM || (`"Combo Point" <` + process.env.EMAIL_USER + `>`);
    await transporter.sendMail({
      from: fromAddr,
      to: order.email,
      subject: `Combo Point \u2014 Order Confirmed \u2014 ${order.orderNumber}`,
      text: textContent
    });
    console.log(`[EMAIL SENT] Customer confirmation email sent to ${order.email} for order ${order.orderNumber}`);
  } catch (err) {
    console.error(`Confirmation email delivery error for order ${order.orderNumber}:`, err.message);
  }
};
