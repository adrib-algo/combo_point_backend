import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

// Admin New Order Alert Email (Main Orders & Free Taste)
export const sendAdminNewOrderAlertEmail = async (order) => {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'combopointcafe@gmail.com';

    const isFreeTaste = order.orderType === 'FREE_TASTE';
    const emailSubject = isFreeTaste
      ? `New Free Taste Request - Token #${order.tokenNumber || 'N/A'}`
      : `New Main Order - Token #${order.tokenNumber || 'N/A'}`;

    const itemsFormatted = order.items && order.items.length > 0
      ? order.items.map(item => `  • ${item.name} × ${item.quantity} (₹${item.price})`).join('\n')
      : '  No items specified';

    const emailBody = `
==================================================
${isFreeTaste ? 'NEW FREE TASTE REQUEST RECEIVED' : 'NEW MAIN ORDER RECEIVED'}
==================================================

Token Number:     #${order.tokenNumber || 'N/A'}
Customer Name:    ${order.customerName || 'N/A'}
Contact Phone:    ${order.phone || order.customerPhone || 'N/A'}
Delivery Address: ${order.deliveryAddress || 'N/A'}
Order Type:       ${isFreeTaste ? 'Free Taste Request' : (order.mainOrderSubMode || order.orderType || 'Instant Order')}
Delivery Date:    ${order.deliveryDate || 'N/A'}
Delivery Time:    ${order.deliveryTime || order.preferredDeliveryTime || 'N/A'}
Order Status:     ${order.status || 'Pending'}
Created At:       ${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}

--------------------------------------------------
ORDER ITEMS:
${itemsFormatted}

--------------------------------------------------
Total Amount:     ₹${order.totalAmount || 0}
==================================================
`;

    console.log(`[EMAIL DISPATCH] Alert email to ${adminEmail} for Token #${order.tokenNumber}...`);
    
    if (!transporter) {
      console.log(`[EMAIL DISPATCH - SIMULATED] SMTP not configured. Logged details:\nSubject: ${emailSubject}\nRecipient: ${adminEmail}\nContent:\n${emailBody}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: `"Combo Point Alert" <${process.env.SMTP_USER || 'no-reply@combopoint.com'}>`,
      to: adminEmail,
      subject: emailSubject,
      text: emailBody,
    });

    console.log(`[EMAIL DISPATCH SUCCESS] Sent ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL DISPATCH ERROR] Non-blocking failure:`, error.message);
    return false;
  }
};

// Customer Order Receipt Email
export const sendCustomerOrderReceiptEmail = async (order) => {
  try {
    if (!order.email) return true;
    const transporter = createTransporter();
    const emailSubject = `Combo Point Order Receipt - Token #${order.tokenNumber || 'N/A'}`;
    const emailBody = `Hello ${order.customerName},\n\nThank you for ordering from Combo Point! Your token number is #${order.tokenNumber}.\nTotal: ₹${order.totalAmount}\nStatus: ${order.status}\n\nWe appreciate your business!`;

    if (!transporter) {
      console.log(`[EMAIL DISPATCH - SIMULATED] Receipt to customer ${order.email}:\n${emailBody}`);
      return true;
    }

    await transporter.sendMail({
      from: `"Combo Point" <${process.env.SMTP_USER || 'no-reply@combopoint.com'}>`,
      to: order.email,
      subject: emailSubject,
      text: emailBody,
    });
    return true;
  } catch (error) {
    console.error(`[EMAIL DISPATCH ERROR] Non-blocking receipt failure:`, error.message);
    return false;
  }
};

// Customer Order Confirmation Email
export const sendCustomerOrderConfirmationEmail = async (order) => {
  try {
    if (!order.email) return true;
    const transporter = createTransporter();
    const emailSubject = `Order Confirmed - Token #${order.tokenNumber || 'N/A'}`;
    const emailBody = `Hello ${order.customerName},\n\nYour order #${order.tokenNumber} has been ${order.status}!\nThank you for choosing Combo Point.`;

    if (!transporter) {
      console.log(`[EMAIL DISPATCH - SIMULATED] Confirmation to customer ${order.email}:\n${emailBody}`);
      return true;
    }

    await transporter.sendMail({
      from: `"Combo Point" <${process.env.SMTP_USER || 'no-reply@combopoint.com'}>`,
      to: order.email,
      subject: emailSubject,
      text: emailBody,
    });
    return true;
  } catch (error) {
    console.error(`[EMAIL DISPATCH ERROR] Non-blocking confirmation failure:`, error.message);
    return false;
  }
};

export const sendMainOrderNotification = sendAdminNewOrderAlertEmail;
export const sendFreeTasteNotification = sendAdminNewOrderAlertEmail;

export default {
  sendAdminNewOrderAlertEmail,
  sendCustomerOrderReceiptEmail,
  sendCustomerOrderConfirmationEmail,
  sendMainOrderNotification,
  sendFreeTasteNotification,
};
