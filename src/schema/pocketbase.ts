// Types mirroring PocketBase collection schemas

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent: string;
  category_type: string;
  sort_order: number;
  is_active: boolean;
  collectionId: string;
  collectionName: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  images: string[];
  thumbnail: string;
  short_description: string;
  description: string;
  occasions: string[];
  categories: string[];
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
  expand?: {
    categories?: Category[];
  };
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  delivery_date: string;
  delivery_time: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  note: string;
  status: "pending" | "confirmed" | "cancelled";
  payment_method: "bank_transfer";
  created: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  sort_order: number;
  is_active: boolean;
  position: "hero" | "promo" | "category";
  collectionId: string;
  collectionName: string;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
}
