import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { siteContentSchema, siteContentPartialSchema, type SiteContent } from "@shared/schema";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerCloudinaryRoutes } from "./cloudinary/routes";

const DEFAULT_CONTENT: SiteContent = {
  hero: {
    headline: "The Purest Form of Radiance",
    subtext: "Experience the single-ingredient potency of 100% Pili Oil. Harvested from the Tree of Hope in the Philippines, this rare elixir restores vitality and softness.",
    bgImage: "/attached_assets/generated_images/luxury_golden_oil_texture_macro_shot.png",
    bottleImage: "/attached_assets/Piliora_with_Flower_1769543566973.JPG",
  },
  science: {
    title: "One Ingredient, Infinite Results",
    content: "Canarium ovatum. A botanical marvel. Rich in essential fatty acids, Vitamin E, and antioxidants, it does not just moisturize—it rebuilds. Our process preserves the oil raw integrity, delivering a bioactive concentration that synthetic formulas cannot replicate.",
    image: "/attached_assets/Piliora_with_Flower_1769543384566.JPG"
  },
  ritual: {
    title: "Daily Ritual",
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
    ]
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
      console.log("Admin user created: PilioraAdmin");
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }

  // Seed initial content if database is empty
  try {
    const existingContent = await storage.getSiteContent();
    if (!existingContent) {
      await storage.updateSiteContent(DEFAULT_CONTENT);
      console.log("Initial site content seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding initial content:", error);
  }
  
  // Get site content
  app.get("/api/settings/content", async (req, res) => {
    try {
      const content = await storage.getSiteContent();
      res.json(content);
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

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      // Simple password check (in production, use bcrypt)
      if (user && user.password === password) {
        res.json({ success: true, user: { id: user.id, username: user.username } });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during login:", error);
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
