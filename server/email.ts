import nodemailer from "nodemailer";
import { Resend } from "resend";
import type { Order } from "@shared/schema";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_USER = process.env.SMTP_USER || "Piliora@piliora.com";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
const FROM_NAME = process.env.FROM_NAME || "PILIORA";
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

let emailMode: "resend" | "smtp" | "none" = "none";
let resendClient: Resend | null = null;
let smtpTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

async function initEmail(): Promise<void> {
  if (RESEND_API_KEY) {
    try {
      resendClient = new Resend(RESEND_API_KEY);
      emailMode = "resend";
      console.log(`[EMAIL] Resend HTTP API initialized (from: ${FROM_EMAIL})`);
      return;
    } catch (err: any) {
      console.error(`[EMAIL] Resend init failed: ${err.message}`);
    }
  }

  if (SMTP_HOST && SMTP_PASSWORD) {
    const configs = [
      { port: parseInt(process.env.SMTP_PORT || "465", 10), secure: process.env.SMTP_SECURE !== "false", label: "primary" },
      { port: 465, secure: true, label: "SSL-465" },
      { port: 587, secure: false, label: "STARTTLS-587" },
      { port: 2525, secure: false, label: "alt-2525" },
    ];

    const seen = new Set<string>();
    const uniqueConfigs = configs.filter(c => {
      const key = `${c.port}:${c.secure}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`[EMAIL] Testing SMTP configs for ${SMTP_HOST}...`);
    for (const config of uniqueConfigs) {
      try {
        console.log(`[EMAIL] Trying ${config.label} (${SMTP_HOST}:${config.port}, secure=${config.secure})...`);
        const transport = nodemailer.createTransport({
          host: SMTP_HOST,
          port: config.port,
          secure: config.secure,
          auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          pool: false,
        } as any);

        await Promise.race([
          transport.verify(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("verify timed out")), 12000)),
        ]);

        console.log(`[EMAIL] SUCCESS — SMTP connected via ${config.label} (${SMTP_HOST}:${config.port})`);
        smtpTransporter = transport;
        emailMode = "smtp";
        return;
      } catch (err: any) {
        console.warn(`[EMAIL] ${config.label} (port ${config.port}) failed: ${err.message}`);
      }
    }

    console.error("[EMAIL] ALL SMTP CONFIGS FAILED");
  }

  if (emailMode === "none") {
    console.warn("[EMAIL] No email provider configured. Set RESEND_API_KEY (for Railway/HTTP) or SMTP vars (for direct SMTP).");
  }
}

initEmail();

async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  if (!resendClient) throw new Error("Resend client not initialized");

  const result = await resendClient.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject,
    html,
  });

  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`);
  }
}

async function sendViaSmtp(to: string, subject: string, html: string): Promise<void> {
  if (!smtpTransporter) throw new Error("SMTP transport not initialized");

  await Promise.race([
    smtpTransporter.sendMail({
      from: `"${FROM_NAME}" <${SMTP_USER}>`,
      to,
      subject,
      html,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("SMTP send timed out after 20s")), 20000)
    ),
  ]);
}

async function sendEmail(to: string, subject: string, html: string) {
  if (emailMode === "none") {
    console.log(`[EMAIL SKIPPED] No provider — To: ${to} | Subject: ${subject}`);
    return;
  }

  console.log(`[EMAIL SENDING] via ${emailMode} — To: ${to} | Subject: ${subject}`);

  try {
    if (emailMode === "resend") {
      await sendViaResend(to, subject, html);
    } else {
      await sendViaSmtp(to, subject, html);
    }
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
  } catch (error: any) {
    console.error(`[EMAIL ERROR] To: ${to} | Subject: ${subject} | Error: ${error.message}`);

    if (emailMode === "smtp") {
      console.log("[EMAIL] Retrying with fresh SMTP connection...");
      smtpTransporter = null;
      try {
        await initEmail();
        if (smtpTransporter) {
          await sendViaSmtp(to, subject, html);
          console.log(`[EMAIL SENT] (retry) To: ${to} | Subject: ${subject}`);
          return;
        }
      } catch (retryErr: any) {
        console.error(`[EMAIL RETRY FAILED] ${retryErr.message}`);
      }
    }

    console.error(`[EMAIL FAILED] To: ${to} | Subject: ${subject}`);
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

        <p style="color: #666; line-height: 1.8; margin-top: 30px;">If you have any questions, reply to this email or contact us at Piliora@piliora.com.</p>
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

        <p style="color: #666; line-height: 1.8;">If you have any questions, reply to this email or contact us at Piliora@piliora.com.</p>
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

        <p style="color: #666; line-height: 1.8;">If you have any questions, reply to this email or contact us at Piliora@piliora.com.</p>
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

        <p style="color: #666; line-height: 1.8;">If you have any questions, reply to this email or contact us at Piliora@piliora.com.</p>
      </div>
      <div style="text-align: center; padding: 30px; background: #1a1a1a; color: #c9a962;">
        <p style="font-size: 11px; letter-spacing: 2px; margin: 0;">&copy; ${new Date().getFullYear()} PILIORA SKINCARE</p>
      </div>
    </div>
  `;
  await sendEmail(order.customerEmail, subject, html);
}
