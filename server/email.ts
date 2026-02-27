import nodemailer from "nodemailer";
import type { Order } from "@shared/schema";

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_SECURE = process.env.SMTP_SECURE !== "false";
const SMTP_USER = process.env.SMTP_USER || "Piliora@piliora.com";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
const FROM_NAME = process.env.FROM_NAME || "PILIORA";

function createTransport() {
  if (!SMTP_HOST || !SMTP_PASSWORD) {
    console.warn("SMTP_HOST or SMTP_PASSWORD not set — emails will be logged but not sent");
    return null;
  }
  console.log(`[EMAIL] Connecting to ${SMTP_HOST}:${SMTP_PORT} as ${SMTP_USER} (secure=${SMTP_SECURE})`);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

const transporter = createTransport();

async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
  } catch (error: any) {
    console.error(`[EMAIL ERROR] ${error.message}`);
  }
}

export async function sendOrderConfirmation(order: Order) {
  const subject = `PILIORA Order Confirmation #${order.id}`;
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="text-align: center; padding: 40px 0; border-bottom: 1px solid #c9a962;">
        <h1 style="font-size: 28px; letter-spacing: 4px; color: #1a1a1a; margin: 0;">PILIORA</h1>
        <p style="color: #c9a962; font-size: 12px; letter-spacing: 3px; margin-top: 8px;">PILI OIL FROM THE PHILIPPINES</p>
      </div>
      <div style="padding: 40px 20px;">
        <h2 style="font-size: 22px; margin-bottom: 20px;">Thank You for Your Order</h2>
        <p style="color: #666; line-height: 1.8;">Dear ${order.customerName},</p>
        <p style="color: #666; line-height: 1.8;">We've received your order and are preparing it with care. You'll receive a shipping notification once your order is on its way.</p>
        
        <div style="background: #f8f6f3; padding: 24px; margin: 30px 0; border-left: 3px solid #c9a962;">
          <h3 style="margin: 0 0 16px; font-size: 16px;">Order #${order.id}</h3>
          <p style="margin: 4px 0; color: #666;"><strong>Product:</strong> ${order.productName}</p>
          <p style="margin: 4px 0; color: #666;"><strong>Quantity:</strong> ${order.quantity}</p>
          ${order.subtotalAmount !== null && order.subtotalAmount !== undefined ? `<p style="margin: 4px 0; color: #666;"><strong>Subtotal:</strong> $${Number(order.subtotalAmount).toFixed(2)}</p>` : ''}
          ${order.shippingAmount !== null && order.shippingAmount !== undefined ? `<p style="margin: 4px 0; color: #666;"><strong>Shipping:</strong> ${Number(order.shippingAmount) === 0 ? 'Free' : '$' + Number(order.shippingAmount).toFixed(2)}</p>` : ''}
          ${order.taxAmount !== null && order.taxAmount !== undefined ? `<p style="margin: 4px 0; color: #666;"><strong>Tax:</strong> $${Number(order.taxAmount).toFixed(2)}</p>` : ''}
          <p style="margin: 8px 0 0; color: #1a1a1a; font-size: 16px;"><strong>Total:</strong> $${Number(order.totalAmount).toFixed(2)}</p>
        </div>

        <div style="margin: 30px 0;">
          <h3 style="font-size: 16px; margin-bottom: 12px;">Shipping To:</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            ${order.customerName}<br>
            ${order.shippingAddress}<br>
            ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}
          </p>
        </div>

        <p style="color: #666; line-height: 1.8; margin-top: 30px;">If you have any questions, reply to this email or contact us at ${SMTP_USER}.</p>
      </div>
      <div style="text-align: center; padding: 30px; background: #1a1a1a; color: #c9a962;">
        <p style="font-size: 11px; letter-spacing: 2px; margin: 0;">&copy; ${new Date().getFullYear()} PILIORA SKINCARE</p>
      </div>
    </div>
  `;
  await sendEmail(order.customerEmail, subject, html);
}

export async function sendShippingUpdate(order: Order) {
  const subject = `Your PILIORA Order #${order.id} Has Shipped!`;
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="text-align: center; padding: 40px 0; border-bottom: 1px solid #c9a962;">
        <h1 style="font-size: 28px; letter-spacing: 4px; color: #1a1a1a; margin: 0;">PILIORA</h1>
        <p style="color: #c9a962; font-size: 12px; letter-spacing: 3px; margin-top: 8px;">PILI OIL FROM THE PHILIPPINES</p>
      </div>
      <div style="padding: 40px 20px;">
        <h2 style="font-size: 22px; margin-bottom: 20px;">Your Order is On Its Way!</h2>
        <p style="color: #666; line-height: 1.8;">Dear ${order.customerName},</p>
        <p style="color: #666; line-height: 1.8;">Great news! Your order #${order.id} has been shipped.</p>
        
        ${order.trackingNumber ? `
        <div style="background: #f8f6f3; padding: 24px; margin: 30px 0; border-left: 3px solid #c9a962;">
          <h3 style="margin: 0 0 8px; font-size: 16px;">Tracking Number</h3>
          <p style="margin: 0; color: #c9a962; font-size: 18px; letter-spacing: 1px;">${order.trackingNumber}</p>
        </div>
        ` : ''}

        <div style="margin: 30px 0;">
          <p style="margin: 4px 0; color: #666;"><strong>Product:</strong> ${order.productName}</p>
          <p style="margin: 4px 0; color: #666;"><strong>Quantity:</strong> ${order.quantity}</p>
        </div>

        <p style="color: #666; line-height: 1.8;">If you have any questions, reply to this email or contact us at ${SMTP_USER}.</p>
      </div>
      <div style="text-align: center; padding: 30px; background: #1a1a1a; color: #c9a962;">
        <p style="font-size: 11px; letter-spacing: 2px; margin: 0;">&copy; ${new Date().getFullYear()} PILIORA SKINCARE</p>
      </div>
    </div>
  `;
  await sendEmail(order.customerEmail, subject, html);
}

export async function sendOrderCancellation(order: Order) {
  const subject = `PILIORA Order #${order.id} Has Been Cancelled`;
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="text-align: center; padding: 40px 0; border-bottom: 1px solid #c9a962;">
        <h1 style="font-size: 28px; letter-spacing: 4px; color: #1a1a1a; margin: 0;">PILIORA</h1>
        <p style="color: #c9a962; font-size: 12px; letter-spacing: 3px; margin-top: 8px;">PILI OIL FROM THE PHILIPPINES</p>
      </div>
      <div style="padding: 40px 20px;">
        <h2 style="font-size: 22px; margin-bottom: 20px;">Order Cancelled</h2>
        <p style="color: #666; line-height: 1.8;">Dear ${order.customerName},</p>
        <p style="color: #666; line-height: 1.8;">Your order #${order.id} has been cancelled. If you did not request this cancellation, please contact us immediately.</p>
        
        <div style="background: #f8f6f3; padding: 24px; margin: 30px 0; border-left: 3px solid #c9a962;">
          <p style="margin: 4px 0; color: #666;"><strong>Order:</strong> #${order.id}</p>
          <p style="margin: 4px 0; color: #666;"><strong>Product:</strong> ${order.productName}</p>
          <p style="margin: 4px 0; color: #666;"><strong>Refund Amount:</strong> $${Number(order.totalAmount).toFixed(2)}</p>
        </div>

        <p style="color: #666; line-height: 1.8;">If you have any questions, reply to this email or contact us at ${SMTP_USER}.</p>
      </div>
      <div style="text-align: center; padding: 30px; background: #1a1a1a; color: #c9a962;">
        <p style="font-size: 11px; letter-spacing: 2px; margin: 0;">&copy; ${new Date().getFullYear()} PILIORA SKINCARE</p>
      </div>
    </div>
  `;
  await sendEmail(order.customerEmail, subject, html);
}

const ADMIN_EMAIL = "Piliora@piliora.com";

export async function sendAdminNewOrderNotification(order: Order) {
  const subject = `New Order #${order.id} — $${Number(order.totalAmount).toFixed(2)}`;
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="text-align: center; padding: 40px 0; border-bottom: 1px solid #c9a962;">
        <h1 style="font-size: 28px; letter-spacing: 4px; color: #1a1a1a; margin: 0;">PILIORA</h1>
        <p style="color: #c9a962; font-size: 12px; letter-spacing: 3px; margin-top: 8px;">ADMIN ORDER NOTIFICATION</p>
      </div>
      <div style="padding: 40px 20px;">
        <h2 style="font-size: 22px; margin-bottom: 20px;">New Order Received</h2>
        
        <div style="background: #f8f6f3; padding: 24px; margin: 20px 0; border-left: 3px solid #c9a962;">
          <h3 style="margin: 0 0 16px; font-size: 16px;">Order #${order.id}</h3>
          <p style="margin: 4px 0; color: #666;"><strong>Customer:</strong> ${order.customerName}</p>
          <p style="margin: 4px 0; color: #666;"><strong>Email:</strong> ${order.customerEmail}</p>
          ${order.phone ? `<p style="margin: 4px 0; color: #666;"><strong>Phone:</strong> ${order.phone}</p>` : ''}
          <p style="margin: 4px 0; color: #666;"><strong>Product:</strong> ${order.productName}</p>
          <p style="margin: 4px 0; color: #666;"><strong>Quantity:</strong> ${order.quantity}</p>
          ${order.subtotalAmount ? `<p style="margin: 4px 0; color: #666;"><strong>Subtotal:</strong> $${Number(order.subtotalAmount).toFixed(2)}</p>` : ''}
          ${order.shippingAmount ? `<p style="margin: 4px 0; color: #666;"><strong>Shipping:</strong> ${Number(order.shippingAmount) === 0 ? 'Free' : '$' + Number(order.shippingAmount).toFixed(2)}</p>` : ''}
          ${order.taxAmount ? `<p style="margin: 4px 0; color: #666;"><strong>Tax:</strong> $${Number(order.taxAmount).toFixed(2)}</p>` : ''}
          <p style="margin: 8px 0 0; color: #1a1a1a; font-size: 16px;"><strong>Total:</strong> $${Number(order.totalAmount).toFixed(2)}</p>
        </div>

        <div style="margin: 30px 0;">
          <h3 style="font-size: 16px; margin-bottom: 12px;">Ship To:</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            ${order.customerName}<br>
            ${order.shippingAddress}<br>
            ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}
          </p>
        </div>

        <p style="color: #999; font-size: 13px;">Customer has been redirected to Stripe for payment. Please verify payment in your Stripe dashboard before shipping.</p>
      </div>
      <div style="text-align: center; padding: 30px; background: #1a1a1a; color: #c9a962;">
        <p style="font-size: 11px; letter-spacing: 2px; margin: 0;">&copy; ${new Date().getFullYear()} PILIORA SKINCARE — ADMIN</p>
      </div>
    </div>
  `;
  await sendEmail(ADMIN_EMAIL, subject, html);
}

export async function sendStatusUpdate(order: Order) {
  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared.",
    shipped: "Your order has been shipped!",
    delivered: "Your order has been delivered. We hope you love your PILIORA Pili Oil!",
    cancelled: "Your order has been cancelled.",
  };

  if (order.status === "shipped") {
    return sendShippingUpdate(order);
  }
  if (order.status === "cancelled") {
    return sendOrderCancellation(order);
  }

  const subject = `PILIORA Order #${order.id} — ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`;
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="text-align: center; padding: 40px 0; border-bottom: 1px solid #c9a962;">
        <h1 style="font-size: 28px; letter-spacing: 4px; color: #1a1a1a; margin: 0;">PILIORA</h1>
        <p style="color: #c9a962; font-size: 12px; letter-spacing: 3px; margin-top: 8px;">PILI OIL FROM THE PHILIPPINES</p>
      </div>
      <div style="padding: 40px 20px;">
        <h2 style="font-size: 22px; margin-bottom: 20px;">Order Update</h2>
        <p style="color: #666; line-height: 1.8;">Dear ${order.customerName},</p>
        <p style="color: #666; line-height: 1.8;">${statusMessages[order.status] || `Your order status has been updated to: ${order.status}`}</p>
        
        <div style="background: #f8f6f3; padding: 24px; margin: 30px 0; border-left: 3px solid #c9a962;">
          <p style="margin: 4px 0; color: #666;"><strong>Order:</strong> #${order.id}</p>
          <p style="margin: 4px 0; color: #666;"><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          <p style="margin: 4px 0; color: #666;"><strong>Product:</strong> ${order.productName}</p>
        </div>

        <p style="color: #666; line-height: 1.8;">If you have any questions, reply to this email or contact us at ${SMTP_USER}.</p>
      </div>
      <div style="text-align: center; padding: 30px; background: #1a1a1a; color: #c9a962;">
        <p style="font-size: 11px; letter-spacing: 2px; margin: 0;">&copy; ${new Date().getFullYear()} PILIORA SKINCARE</p>
      </div>
    </div>
  `;
  await sendEmail(order.customerEmail, subject, html);
}
