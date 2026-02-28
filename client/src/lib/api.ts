import type { SiteContent, Order } from "@shared/schema";

function getAdminAuthHeader(): Record<string, string> {
  const creds = sessionStorage.getItem("adminCredentials");
  if (!creds) return {};
  return { Authorization: `Basic ${btoa(creds)}` };
}

export function setAdminCredentials(username: string, password: string) {
  sessionStorage.setItem("adminCredentials", `${username}:${password}`);
}

export function clearAdminCredentials() {
  sessionStorage.removeItem("adminCredentials");
}

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
    headers: { "Content-Type": "application/json", ...getAdminAuthHeader() },
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
    headers: { "Content-Type": "application/json", ...getAdminAuthHeader() },
    body: JSON.stringify({ currentUsername, currentPassword, newUsername, newPassword }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update credentials");
  }
  
  return response.json();
}

export async function uploadImage(file: File): Promise<{ success: boolean; path: string }> {
  const urlResponse = await fetch("/api/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAdminAuthHeader() },
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
  
  if (uploadInfo.signature) {
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

export async function validatePromoCode(code: string): Promise<{ valid: boolean; code: string; discount: number; freeShipping: boolean; label: string }> {
  const response = await fetch("/api/promo/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Invalid promo code");
  }

  return response.json();
}

export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  phone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  quantity: number;
  promoCode?: string;
}): Promise<{ success: boolean; order: Order }> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to place order");
  }

  return response.json();
}

export async function createCheckoutSession(data: {
  orderId: number;
  customerEmail: string;
  quantity: number;
  promoCode?: string;
}): Promise<{ url: string; orderId: number }> {
  const response = await fetch("/api/checkout/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create checkout session");
  }

  return response.json();
}

export async function verifyCheckoutSession(sessionId: string): Promise<{ order: Order; paymentStatus: string }> {
  const response = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify payment");
  }

  return response.json();
}

export async function fetchOrders(): Promise<Order[]> {
  const response = await fetch("/api/orders", {
    headers: { ...getAdminAuthHeader() },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  return response.json();
}

export async function updateOrderStatus(id: number, status: string, trackingNumber?: string): Promise<Order> {
  const response = await fetch(`/api/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAdminAuthHeader() },
    body: JSON.stringify({ status, trackingNumber }),
  });

  if (!response.ok) {
    throw new Error("Failed to update order status");
  }

  return response.json();
}

export async function refundOrder(id: number): Promise<{ order: Order; refund: any; message: string }> {
  const response = await fetch(`/api/orders/${id}/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAdminAuthHeader() },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to process refund");
  }

  return response.json();
}

export async function updateOrderDetails(id: number, data: { notes?: string; trackingNumber?: string }): Promise<Order> {
  const response = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAdminAuthHeader() },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update order");
  }

  return response.json();
}
