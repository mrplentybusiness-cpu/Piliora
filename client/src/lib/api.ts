import type { SiteContent } from "@shared/schema";

export async function fetchSiteContent(): Promise<SiteContent | null> {
  const response = await fetch("/api/settings/content");
  if (!response.ok) {
    throw new Error("Failed to fetch site content");
  }
  return response.json();
}

export async function updateSiteContent(content: Partial<SiteContent>): Promise<SiteContent> {
  const response = await fetch("/api/settings/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update site content");
  }
  
  return response.json();
}

export async function adminLogin(username: string, password: string): Promise<{ success: boolean; user?: { id: string; username: string } }> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
  
  return response.json();
}

export async function updateAdminCredentials(
  currentUsername: string,
  currentPassword: string,
  newUsername: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch("/api/admin/update-credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentUsername, currentPassword, newUsername, newPassword }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update credentials");
  }
  
  return response.json();
}

export async function uploadImage(file: File): Promise<{ success: boolean; path: string }> {
  // Step 1: Request upload info from backend
  const urlResponse = await fetch("/api/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });
  
  if (!urlResponse.ok) {
    const error = await urlResponse.json();
    throw new Error(error.error || "Failed to get upload URL");
  }
  
  const uploadInfo = await urlResponse.json();
  
  // Check if using Cloudinary (has signature) or Object Storage (has objectPath)
  if (uploadInfo.signature) {
    // Cloudinary upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", uploadInfo.apiKey);
    formData.append("timestamp", uploadInfo.timestamp.toString());
    formData.append("signature", uploadInfo.signature);
    formData.append("folder", uploadInfo.folder);
    
    const uploadResponse = await fetch(uploadInfo.uploadURL, {
      method: "POST",
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to Cloudinary");
    }
    
    const result = await uploadResponse.json();
    return { success: true, path: result.secure_url };
  } else {
    // Replit Object Storage upload
    const uploadResponse = await fetch(uploadInfo.uploadURL, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });
    
    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to storage");
    }
    
    return { success: true, path: uploadInfo.objectPath };
  }
}
