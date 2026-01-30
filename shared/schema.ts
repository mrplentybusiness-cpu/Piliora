import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  }),
  science: z.object({
    title: z.string(),
    content: z.string(),
    image: z.string(),
  }),
  ritual: z.object({
    title: z.string(),
    steps: z.array(z.object({
      title: z.string(),
      text: z.string(),
    })),
  }),
  product: z.object({
    name: z.string(),
    price: z.number(),
    amazonLink: z.string(),
    image: z.string(),
    lifestyleImage: z.string(),
    images: z.array(z.string()),
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
});

export const siteContentPartialSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subtext: z.string(),
    bgImage: z.string(),
    bottleImage: z.string(),
  }).partial().optional(),
  science: z.object({
    title: z.string(),
    content: z.string(),
    image: z.string(),
  }).partial().optional(),
  ritual: z.object({
    title: z.string(),
    steps: z.array(z.object({
      title: z.string(),
      text: z.string(),
    })),
  }).partial().optional(),
  product: z.object({
    name: z.string(),
    price: z.number(),
    amazonLink: z.string(),
    image: z.string(),
    lifestyleImage: z.string(),
    images: z.array(z.string()),
  }).partial().optional(),
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
  }).partial().optional(),
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
  }).partial().optional(),
  benefits: z.object({
    label: z.string(),
    heading: z.string(),
    subtitle: z.string(),
    items: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
  }).partial().optional(),
  gallery: z.object({
    label: z.string(),
    heading: z.string(),
  }).partial().optional(),
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
export type SiteContent = z.infer<typeof siteContentSchema>;
