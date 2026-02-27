import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { siteContentSchema, siteContentPartialSchema, checkoutSchema, type SiteContent } from "@shared/schema";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerCloudinaryRoutes } from "./cloudinary/routes";
import { sendOrderConfirmation, sendStatusUpdate, sendAdminNewOrderNotification } from "./email";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== undefined && source[key] !== null) {
      if (
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        typeof target[key] === "object" &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
}

async function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString();
    const [username, password] = decoded.split(":");
    const user = await storage.getUserByUsername(username);
    if (user && user.password === password) {
      return next();
    }
    return res.status(401).json({ error: "Invalid credentials" });
  } catch {
    return res.status(401).json({ error: "Authentication failed" });
  }
}

const DEFAULT_CONTENT: SiteContent = {
  hero: {
    headline: "The Purest Form of Radiance",
    subtext: "Experience the single-ingredient potency of 100% Pili Oil. Harvested from the Tree of Hope in the Philippines, this rare elixir restores vitality and softness.",
    bgImage: "/attached_assets/generated_images/luxury_golden_oil_texture_macro_shot.png",
    bottleImage: "/attached_assets/Piliora_with_Flower_1769543566973.JPG",
    originText: "Pili Oil from the Philippines",
    shopButtonText: "Shop Now",
    learnMoreButtonText: "Learn More",
  },
  science: {
    title: "One Ingredient, Infinite Results",
    content: "Canarium ovatum. A botanical marvel. Rich in essential fatty acids, Vitamin E, and antioxidants, it does not just moisturize—it rebuilds. Our process preserves the oil raw integrity, delivering a bioactive concentration that synthetic formulas cannot replicate.",
    image: "/attached_assets/Piliora_with_Flower_1769543384566.JPG",
    sectionLabel: "The Science",
  },
  ritual: {
    title: "Daily Ritual",
    sectionHeading: "The Daily Ritual",
    sectionSubheading: "Elevate your routine",
    steps: [
      { title: "Prepare", text: "Cleanse skin thoroughly with warm water to open pores." },
      { title: "Apply", text: "Warm 2-3 drops of Pili Oil in your palms and press gently into face and neck." },
      { title: "Protect", text: "Allow to absorb fully. The antioxidants form a natural barrier against environmental stressors." }
    ]
  },
  product: {
    name: "Piliora Pili Oil",
    price: 85,
    amazonLink: "https://www.amazon.com/dp/EXAMPLE_LINK",
    image: "/attached_assets/5F1A3299_1765827020713.jpeg",
    lifestyleImage: "/attached_assets/Piliora_with_Flower_1769543384566.JPG",
    images: [
      "/attached_assets/5F1A3299_1765827020713.jpeg",
      "/attached_assets/generated_images/skincare_product_lifestyle_on_stone.png",
      "/attached_assets/generated_images/botanical_ingredients_minimalist_composition.png"
    ],
    subtitle: "The Essence of Moisturization",
    description: "Experience the single-ingredient potency of 100% pure Pili Oil. Cold-pressed from the kernels of the Canarium ovatum tree in the Philippines, this rare elixir delivers deep hydration, antioxidant protection, and a natural radiance.",
    volume: "30ml / 1oz",
    tagline: "Pili Oil from the Philippines",
    sectionLabel: "The Collection",
    quickBuyDescription: "100% pure, cold-pressed Pili Oil. A single-ingredient luxury for face, neck, and hair.",
    shippingNote: "Free shipping over $150",
    guaranteeNote: "30-day guarantee",
    ingredientsIntro: "Our formula is simple, pure, and effective.",
    ingredients: ["Canarium Ovatum (Pili) Nut Oil — 100%"],
    benefits: [
      { title: "Deep Hydration", description: "Rich in essential fatty acids that penetrate and restore the skin's moisture barrier." },
      { title: "Anti-Aging", description: "Packed with Vitamin E and antioxidants to fight free radicals and prevent premature aging." },
      { title: "Fast Absorbing", description: "Lightweight molecular structure absorbs instantly without greasy residue." },
      { title: "All Natural", description: "100% pure Pili Oil — no fillers, preservatives, or synthetic additives." },
    ],
    usageMorning: "Apply 2-3 drops to clean, damp skin. Massage gently in upward motions.",
    usageEvening: "Use as the final step in your skincare routine to lock in moisture.",
    usageHair: "Rub 1-2 drops between palms and smooth over frizzy ends.",
  },
  story: {
    heroLabel: "Our Heritage",
    heroHeadline: "The Tree of Hope",
    heroIntro: "From the volcanic soil of the Philippines comes a gift of nature — the Pili tree, known locally as the Tree of Hope for its remarkable resilience and life-giving properties.",
    originLabel: "The Origin",
    originHeading: "Canarium Ovatum",
    originContent1: "Pronounced pee-lee-aura — PILIORA takes its name from the Pili tree (Canarium ovatum), a species endemic to the Philippines. For centuries, Filipino communities have revered this tree not just for its prized nuts, but for the precious oil extracted from its kernel.",
    originContent2: "Growing in the nutrient-rich volcanic soil of the Bicol region, the Pili tree thrives in conditions that infuse its oil with an exceptional concentration of vitamins, antioxidants, and essential fatty acids.",
    originContent3: "We partner directly with local farming communities, ensuring fair trade practices and sustainable harvesting methods that protect both the trees and the livelihoods of the families who tend them.",
    originImage: "",
    originRegionTitle: "Bicol Region, Philippines",
    originRegionSubtitle: "Where volcanic soil meets tropical climate",
    philosophyLabel: "Our Philosophy",
    philosophyHeading: "One Ingredient. Pure Intention.",
    philosophyIntro: "In a world of complex formulations and lengthy ingredient lists, we chose a different path. PILIORA is 100% pure Pili Oil — nothing added, nothing taken away.",
    philosophyItems: [
      { title: "Sustainably Sourced", description: "Every drop is ethically harvested from trees grown without pesticides or chemicals, supporting local Filipino communities." },
      { title: "Single Ingredient", description: "We believe in the power of purity. No fillers, no preservatives, no synthetic fragrances — just natures perfect formula." },
      { title: "Cold-Pressed", description: "Our gentle extraction process preserves the oils natural bioactive compounds, ensuring maximum potency and efficacy." }
    ],
    commitmentLabel: "Our Commitment",
    commitmentHeading: "Beauty That Gives Back",
    commitmentContent1: "Every purchase of PILIORA directly supports the farming communities of the Bicol region. We pay fair wages, invest in sustainable farming practices, and contribute to local education initiatives.",
    commitmentContent2: "When you choose PILIORA, youre not just choosing exceptional skincare — youre choosing to be part of a movement that values people, planet, and purity above all else."
  },
  layout: {
    headerTagline: "One ingredient. One ritual.",
    footerDescription: "Organic luxury skincare harvested from the volcanic soil of the Philippines. Pure, potent, and ethically sourced.",
    copyrightText: "Piliora Skincare. All rights reserved.",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    mobileMenuTagline: "Pure Pili Oil from the Philippines",
    navHomeLabel: "Home",
    navStoryLabel: "Our Story",
    navAboutLabel: "About",
    footerLogo: "/logo-footer.png",
    mobileLogo: "/logo-footer.png"
  },
  benefits: {
    label: "Nature's Perfect Formula",
    heading: "The Power of Pili Oil",
    subtitle: "Discover why this single ingredient delivers what complex formulas cannot.",
    items: [
      { title: "Vitamin E Rich", description: "Natural antioxidant protection that fights free radicals and prevents premature aging." },
      { title: "Essential Fatty Acids", description: "Omega 6 & 9 penetrate deep to restore skin's moisture barrier and elasticity." },
      { title: "Rapid Absorption", description: "Lightweight molecular structure absorbs instantly without greasy residue." },
      { title: "Anti-Inflammatory", description: "Soothes irritation, reduces redness, and calms sensitive skin conditions." }
    ]
  },
  gallery: {
    label: "The Experience",
    heading: "Luxury in Every Detail"
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Initialize admin user if it doesn't exist
  try {
    const existingAdmin = await storage.getUserByUsername("PilioraAdmin");
    if (!existingAdmin) {
      await storage.createUser({
        username: "PilioraAdmin",
        password: "Piliora123"
      });
      console.log("Admin user initialized");
    }
  } catch (error: any) {
    console.error("Error initializing admin:", error.message);
  }

  // Seed initial content if database is empty
  try {
    const existingContent = await storage.getSiteContent();
    if (!existingContent) {
      await storage.updateSiteContent(DEFAULT_CONTENT);
      console.log("Site content initialized");
    }
  } catch (error: any) {
    console.error("Error seeding content:", error.message);
  }
  
  // Get site content
  app.get("/api/settings/content", async (req, res) => {
    try {
      const stored = await storage.getSiteContent();
      const merged = deepMerge(DEFAULT_CONTENT, stored || {});
      res.json(merged);
    } catch (error) {
      console.error("Error fetching site content:", error);
      res.status(500).json({ error: "Failed to fetch site content" });
    }
  });

  // Update site content
  app.post("/api/settings/content", async (req, res) => {
    try {
      const validated = siteContentPartialSchema.parse(req.body);
      const updated = await storage.updateSiteContent(validated as any);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        res.status(400).json({ error: "Invalid content format", details: error.errors });
      } else {
        console.error("Error updating site content:", error);
        res.status(500).json({ error: "Failed to update site content" });
      }
    }
  });

  // Debug endpoint - only available in development for security
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/admin/debug", async (req, res) => {
      try {
        const admin = await storage.getUserByUsername("PilioraAdmin");
        res.json({
          databaseConnected: true,
          adminUserExists: !!admin,
          environment: process.env.NODE_ENV || "development",
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        res.json({
          databaseConnected: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (user && user.password === password) {
        res.json({ success: true, user: { id: user.id, username: user.username } });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error: any) {
      console.error("[LOGIN] Error:", error.message);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Register upload routes - use Cloudinary if fully configured, otherwise use Replit Object Storage
  const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                process.env.CLOUDINARY_API_KEY && 
                                process.env.CLOUDINARY_API_SECRET;
  
  if (cloudinaryConfigured) {
    console.log("Using Cloudinary for image uploads");
    registerCloudinaryRoutes(app);
  } else {
    console.log("Using Replit Object Storage for image uploads");
    registerObjectStorageRoutes(app);
  }

  // Create order (checkout)
  app.post("/api/orders", async (req, res) => {
    try {
      const validated = checkoutSchema.parse(req.body);
      const siteContent = await storage.getSiteContent();
      const product = siteContent?.product || DEFAULT_CONTENT.product;
      
      const unitPrice = product.price;
      const subtotal = unitPrice * validated.quantity;
      const NY_TAX_RATE = 0.08875;
      const taxAmount = Math.round(subtotal * NY_TAX_RATE * 100) / 100;
      const SHIPPING_COST = 8.99;
      const FREE_SHIPPING_THRESHOLD = 150;
      const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const totalAmount = subtotal + taxAmount + shippingAmount;

      const order = await storage.createOrder({
        customerName: validated.customerName,
        customerEmail: validated.customerEmail,
        phone: validated.phone || null,
        shippingAddress: validated.shippingAddress,
        shippingCity: validated.shippingCity,
        shippingState: validated.shippingState,
        shippingZip: validated.shippingZip,
        productName: product.name,
        quantity: validated.quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotalAmount: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        shippingAmount: shippingAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
        trackingNumber: null,
        notes: null,
      });

      sendOrderConfirmation(order).catch(err => console.error("Customer email error:", err.message));
      sendAdminNewOrderNotification(order).catch(err => console.error("Admin email error:", err.message));

      res.json({ success: true, order });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid checkout data", details: error.errors });
      } else {
        console.error("Order creation error:", error);
        res.status(500).json({ error: "Failed to create order" });
      }
    }
  });

  // Get all orders (admin)
  app.get("/api/orders", adminAuth, async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get single order (admin)
  app.get("/api/orders/:id", adminAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Update order status (admin)
  app.patch("/api/orders/:id/status", adminAuth, async (req, res) => {
    try {
      const { status, trackingNumber } = req.body;
      const validStatuses = ["pending", "pending_payment", "confirmed", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(parseInt(req.params.id), status, trackingNumber);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      sendStatusUpdate(order).catch(err => console.error("Email error:", err.message));

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Update order details (admin)
  app.patch("/api/orders/:id", adminAuth, async (req, res) => {
    try {
      const { notes, trackingNumber } = req.body;
      const order = await storage.updateOrder(parseInt(req.params.id), { notes, trackingNumber });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Stripe publishable key for frontend
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error: any) {
      console.error("Error getting Stripe key:", error.message);
      res.status(500).json({ error: "Stripe not configured" });
    }
  });

  // Create Stripe Checkout Session
  app.post("/api/checkout/create-session", async (req, res) => {
    try {
      const validated = checkoutSchema.parse(req.body);
      const siteContent = await storage.getSiteContent();
      const product = siteContent?.product || DEFAULT_CONTENT.product;

      const unitPrice = product.price;
      const subtotal = unitPrice * validated.quantity;
      const NY_TAX_RATE = 0.08875;
      const taxAmount = Math.round(subtotal * NY_TAX_RATE * 100) / 100;
      const SHIPPING_COST = 8.99;
      const FREE_SHIPPING_THRESHOLD = 150;
      const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const totalAmount = subtotal + taxAmount + shippingAmount;

      const order = await storage.createOrder({
        customerName: validated.customerName,
        customerEmail: validated.customerEmail,
        phone: validated.phone || null,
        shippingAddress: validated.shippingAddress,
        shippingCity: validated.shippingCity,
        shippingState: validated.shippingState,
        shippingZip: validated.shippingZip,
        productName: product.name,
        quantity: validated.quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotalAmount: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        shippingAmount: shippingAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        status: "pending_payment",
        trackingNumber: null,
        notes: null,
      });

      const stripe = await getUncachableStripeClient();
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const lineItems: any[] = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.volume || '30ml / 1oz',
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: validated.quantity,
        },
      ];

      if (shippingAmount > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: { name: 'Shipping' },
            unit_amount: Math.round(shippingAmount * 100),
          },
          quantity: 1,
        });
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'NY State Tax (8.875%)' },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout?qty=${validated.quantity}`,
        customer_email: validated.customerEmail,
        metadata: {
          order_id: order.id.toString(),
        },
      });

      await storage.updateOrder(order.id, {
        stripeSessionId: session.id,
      } as any);

      res.json({ url: session.url, orderId: order.id });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid checkout data", details: error.errors });
      } else {
        console.error("Checkout session error:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
      }
    }
  });

  // Verify Stripe Checkout Session and confirm order
  app.get("/api/checkout/verify", async (req, res) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Missing session_id" });
      }

      const order = await storage.getOrderByStripeSessionId(sessionId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.status === "pending_payment") {
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
          const updatedOrder = await storage.updateOrderStatus(order.id, "confirmed");
          await storage.updateOrder(order.id, {
            stripePaymentIntentId: session.payment_intent as string,
          } as any);

          sendOrderConfirmation(updatedOrder || order).catch(err =>
            console.error("Email error:", err.message)
          );

          return res.json({ order: updatedOrder || order, paymentStatus: 'paid' });
        }
      }

      res.json({ order, paymentStatus: order.status === 'pending_payment' ? 'pending' : 'paid' });
    } catch (error: any) {
      console.error("Verify error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Update admin credentials
  app.post("/api/admin/update-credentials", async (req, res) => {
    try {
      const { currentUsername, currentPassword, newUsername, newPassword } = req.body;
      
      if (!currentUsername || !currentPassword || !newUsername || !newPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Verify current credentials
      const user = await storage.getUserByUsername(currentUsername);
      if (!user || user.password !== currentPassword) {
        return res.status(401).json({ error: "Current credentials are incorrect" });
      }

      // Check if new username is already taken by another user
      if (newUsername !== currentUsername) {
        const existingUser = await storage.getUserByUsername(newUsername);
        if (existingUser) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }

      // Update credentials
      const updated = await storage.updateUserCredentials(user.id, newUsername, newPassword);
      if (updated) {
        res.json({ success: true, message: "Credentials updated successfully" });
      } else {
        res.status(500).json({ error: "Failed to update credentials" });
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
      res.status(500).json({ error: "Failed to update credentials" });
    }
  });

  return httpServer;
}
