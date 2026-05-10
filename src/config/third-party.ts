// Centralized third-party service configuration
// All external URLs, API endpoints, and service keys go here

export const IS_PROD = process.env.NODE_ENV === "production";

// --- PocketBase ---
export const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

// --- Cloudflare Image Resizing ---
export const CF_IMAGE_BASE = "/cdn-cgi/image";

// --- Zalo ---
const ZALO_BASE = "https://zalo.me";
export const ZALO_PHONE = "0976491322";
export const zaloLink = (phone: string) => `${ZALO_BASE}/${phone}`;

// --- Social Media ---
export const SOCIAL = {
  facebook: "https://facebook.com/vuonhoatuoi",
  instagram: "https://instagram.com/vuonhoatuoi",
};

// --- Google Maps ---
export const googleMapsLink = (address: string) =>
  `https://maps.google.com/?q=${encodeURIComponent(address)}`;

// --- Provinces Open API ---
export const PROVINCES_API = "https://provinces.open-api.vn/api";
export const HCMC_CODE = 79;

// --- Site ---
export const SITE_URL = "https://vuonhoatuoi.vn";
