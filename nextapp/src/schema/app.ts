// App-level types (not tied to PocketBase collections)

import type { Product } from "./pocketbase";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export interface SiteContact {
  phone: string;
  phoneDisplay: string;
  zalo: string;
  zaloGroup: string;
  email: string;
  addresses: string[];
  openingHours: string;
  freeShippingNote: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface District {
  code: number;
  name: string;
}

export interface Ward {
  code: number;
  name: string;
}

export interface CfImageOptions {
  width?: number;
  height?: number;
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  quality?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
}
