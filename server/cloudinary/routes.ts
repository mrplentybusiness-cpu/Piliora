import type { Express } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export function registerCloudinaryRoutes(app: Express): void {
  // Configure Cloudinary from environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload image to Cloudinary
  app.post("/api/uploads/cloudinary", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ error: "Cloudinary not configured" });
      }

      // Upload to Cloudinary
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
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Generate signed upload URL for direct browser uploads
  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Missing required field: name" });
      }

      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ error: "Cloudinary not configured" });
      }

      const timestamp = Math.round(Date.now() / 1000);
      const folder = "piliora";
      
      // Generate signature for direct upload
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
    } catch (error) {
      console.error("Error generating upload signature:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });
}
