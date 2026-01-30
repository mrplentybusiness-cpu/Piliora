import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { siteContentSchema, siteContentPartialSchema } from "@shared/schema";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerCloudinaryRoutes } from "./cloudinary/routes";

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
