import { cache } from "react";
import type { Settings } from "./types";

export interface SiteContact {
  phone: string;
  phoneDisplay: string;
  zalo: string;
  email: string;
  addresses: string[];
  openingHours: string;
  freeShippingNote: string;
}

const FALLBACK: SiteContact = {
  phone: "0976491322",
  phoneDisplay: "0976.491.322",
  zalo: "https://zalo.me/0976491322",
  email: "cskh@vuonhoatuoi.vn",
  addresses: [
    "183/37 Đường 3 Tháng 2, Phường Vườn Lài, TPHCM",
    "704/19 Nguyễn Đình Chiểu, Phường 1, Quận 3, TPHCM",
  ],
  openingHours: "08:00 – 21:00 mỗi ngày",
  freeShippingNote: "",
};

function mapSettings(records: Settings[]): SiteContact {
  const get = (key: string) => records.find((r) => r.key === key)?.value ?? "";

  const addresses = [get("address_1"), get("address_2")].filter(Boolean);
  if (addresses.length === 0) addresses.push(...FALLBACK.addresses);

  return {
    phone: get("phone") || FALLBACK.phone,
    phoneDisplay: get("hotline_display") || FALLBACK.phoneDisplay,
    zalo: get("zalo") || FALLBACK.zalo,
    email: get("email") || FALLBACK.email,
    addresses,
    openingHours: get("opening_hours") || FALLBACK.openingHours,
    freeShippingNote: get("free_shipping_note"),
  };
}

export const getSiteSettings = cache(async (): Promise<SiteContact> => {
  try {
    const { default: pb } = await import("./pocketbase");
    const records = await pb.collection("settings").getFullList<Settings>();
    return mapSettings(records);
  } catch {
    return FALLBACK;
  }
});
