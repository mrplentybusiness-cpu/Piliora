import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, serial, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
});

export const siteContentSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subtext: z.string(),
    bgImage: z.string(),
    bottleImage: z.string(),
    originText: z.string().default("Pili Oil from the Philippines"),
    shopButtonText: z.string().default("Shop Now"),
    learnMoreButtonText: z.string().default("Learn More"),
  }),
  science: z.object({
    title: z.string(),
    content: z.string(),
    image: z.string(),
    sectionLabel: z.string().default("The Science"),
  }),
  ritual: z.object({
    title: z.string(),
    steps: z.array(z.object({
      title: z.string(),
      text: z.string(),
    })),
    sectionHeading: z.string().default("The Daily Ritual"),
    sectionSubheading: z.string().default("Elevate your routine"),
  }),
  product: z.object({
    name: z.string(),
    price: z.number(),
    amazonLink: z.string(),
    image: z.string(),
    lifestyleImage: z.string(),
    images: z.array(z.string()),
    subtitle: z.string().default("The Essence of Moisturization"),
    description: z.string().default("Experience the single-ingredient potency of 100% pure Pili Oil. Cold-pressed from the kernels of the Canarium ovatum tree in the Philippines, this rare elixir delivers deep hydration, antioxidant protection, and a natural radiance."),
    volume: z.string().default("30ml / 1oz"),
    tagline: z.string().default("Pili Oil from the Philippines"),
    sectionLabel: z.string().default("The Collection"),
    quickBuyDescription: z.string().default("100% pure, cold-pressed Pili Oil. A single-ingredient luxury for face, neck, and hair."),
    shippingNote: z.string().default("Free shipping over $150"),
    guaranteeNote: z.string().default(""),
    ingredientsIntro: z.string().default("Our formula is simple, pure, and effective."),
    ingredients: z.array(z.string()).default(["Canarium Ovatum (Pili) Nut Oil — 100%"]),
    benefits: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })).default([
      { title: "Deep Hydration", description: "Rich in essential fatty acids that penetrate and restore the skin's moisture barrier." },
      { title: "Anti-Aging", description: "Packed with Vitamin E and antioxidants to fight free radicals and prevent premature aging." },
      { title: "Fast Absorbing", description: "Lightweight molecular structure absorbs instantly without greasy residue." },
      { title: "All Natural", description: "100% pure Pili Oil — no fillers, preservatives, or synthetic additives." },
    ]),
    usageMorning: z.string().default("Apply 2-3 drops to clean, damp skin. Massage gently in upward motions."),
    usageEvening: z.string().default("Use as the final step in your skincare routine to lock in moisture."),
    usageHair: z.string().default("Rub 1-2 drops between palms and smooth over frizzy ends."),
    packOptions: z.array(z.object({
      quantity: z.number(),
      label: z.string(),
      price: z.number(),
      image: z.string().default(""),
      visible: z.boolean().default(true),
    })).default([
      { quantity: 1, label: "1 Pack", price: 85, image: "", visible: true },
      { quantity: 2, label: "2 Pack", price: 160, image: "", visible: true },
      { quantity: 5, label: "5 Pack", price: 375, image: "", visible: true },
      { quantity: 10, label: "10 Pack", price: 700, image: "", visible: true },
    ]),
  }),
  story: z.object({
    heroLabel: z.string(),
    heroHeadline: z.string(),
    heroIntro: z.string(),
    originLabel: z.string(),
    originHeading: z.string(),
    originContent1: z.string(),
    originContent2: z.string(),
    originContent3: z.string(),
    originImage: z.string(),
    originRegionTitle: z.string(),
    originRegionSubtitle: z.string(),
    philosophyLabel: z.string(),
    philosophyHeading: z.string(),
    philosophyIntro: z.string(),
    philosophyItems: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
    commitmentLabel: z.string(),
    commitmentHeading: z.string(),
    commitmentContent1: z.string(),
    commitmentContent2: z.string(),
  }),
  layout: z.object({
    headerTagline: z.string(),
    footerDescription: z.string(),
    copyrightText: z.string(),
    instagramUrl: z.string(),
    facebookUrl: z.string(),
    mobileMenuTagline: z.string(),
    navHomeLabel: z.string(),
    navStoryLabel: z.string(),
    navAboutLabel: z.string(),
    footerLogo: z.string(),
    mobileLogo: z.string(),
  }),
  benefits: z.object({
    label: z.string(),
    heading: z.string(),
    subtitle: z.string(),
    items: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
  }),
  gallery: z.object({
    label: z.string(),
    heading: z.string(),
  }),
  promoCodes: z.array(z.object({
    code: z.string(),
    discount: z.number(),
    label: z.string(),
    active: z.boolean().default(true),
  })).default([
    { code: "PILIORA99", discount: 0.99, label: "99% off", active: true },
    { code: "PILIORA50", discount: 0.50, label: "50% off", active: true },
    { code: "PILIORA20", discount: 0.20, label: "20% off", active: true },
  ]),
});

export const siteContentPartialSchema = siteContentSchema.deepPartial();

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  phone: text("phone"),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingZip: text("shipping_zip").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotalAmount: numeric("subtotal_amount", { precision: 10, scale: 2 }),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }),
  shippingAmount: numeric("shipping_amount", { precision: 10, scale: 2 }),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }),
  promoCode: text("promo_code"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email required"),
  phone: z.string().optional(),
  shippingAddress: z.string().min(5, "Address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingState: z.string().min(2, "State is required"),
  shippingZip: z.string().min(5, "ZIP code is required"),
  quantity: z.number().min(1).default(1),
  promoCode: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
