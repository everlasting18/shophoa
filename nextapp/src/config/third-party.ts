// Centralized third-party service configuration
// All external URLs, API endpoints, and service keys go here

export const IS_PROD = process.env.NODE_ENV === "production";

// --- PocketBase ---
export const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

// --- Cloudflare Image Resizing ---
export const CF_IMAGE_BASE = "/cdn-cgi/image";

// --- Photo CDN (PocketBase file proxy) ---
export const PHOTO_BASE = "https://photo.tiemhoanhatinh.com";

// --- Zalo ---
const ZALO_BASE = "https://zalo.me";
export const ZALO_PHONE = "0976491322";
export const zaloLink = (phone: string) => `${ZALO_BASE}/${phone}`;

// --- Social Media ---
export const SOCIAL = {
  facebook: "https://facebook.com/tiemhoanhatinh",
  instagram: "https://instagram.com/tiemhoanhatinh",
};

// --- GrabMart ---
export const GRABMART_URL = "https://app.grab.com/s/3mI7RZnm?sourceID=20260523_162334_526E7D43F340453EAD0063A2CDC0723C_MEXMPS";

// --- Google Maps ---
export const googleMapsLink = (address: string) =>
  `https://maps.google.com/?q=${encodeURIComponent(address)}`;

export const GMAPS_CHECKIN_URL = "https://maps.app.goo.gl/KodYdF37hcyaFxML6";

// --- Provinces Open API ---
export const PROVINCES_API = "https://provinces.open-api.vn/api";
export const HCMC_CODE = 79;

// --- Site ---
export const SITE_URL = "https://tiemhoanhatinh.com";
