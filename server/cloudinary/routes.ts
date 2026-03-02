import type { Express, Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { storage } from "../storage";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

async function uploadAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const decoded = Buffer.from(authHeader.slice(6), "base64").toString();
  const [username, password] = decoded.split(":");
  const user = await storage.getUserByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  next();
}

async function verifyCloudinaryCredentials(): Promise<void> {
  try {
    await cloudinary.api.ping();
    console.log("[CLOUDINARY] Credentials verified — connection OK");
  } catch (err: any) {
    console.error(`[CLOUDINARY] Credential verification FAILED: ${err.message}`);
    console.error("[CLOUDINARY] Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET values in Railway");
  }
}

export function registerCloudinaryRoutes(app: Express): void {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  verifyCloudinaryCredentials();

  app.post("/api/uploads/cloudinary", uploadAuth, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ error: "Cloudinary not configured" });
      }

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "piliora",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      res.json({
        success: true,
        path: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error: any) {
      console.error("[CLOUDINARY] Upload error:", error.message || error);
      if (error.http_code) console.error("[CLOUDINARY] HTTP code:", error.http_code);
      res.status(500).json({ error: `Upload failed: ${error.message || "Unknown error"}` });
    }
  });

  app.post("/api/uploads/request-url", uploadAuth, async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Missing required field: name" });
      }

      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ error: "Cloudinary not configured" });
      }

      const timestamp = Math.round(Date.now() / 1000);
      const folder = "piliora";
      
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET!
      );

      res.json({
        uploadURL: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      });
    } catch (error: any) {
      console.error("[CLOUDINARY] Signature error:", error.message || error);
      res.status(500).json({ error: `Failed to generate upload URL: ${error.message || "Unknown error"}` });
    }
  });
}
