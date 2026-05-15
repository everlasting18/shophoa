import { cache } from "react";
import type { Settings, SiteContact } from "@/schema";
import { CONTACT } from "@/config";

const FALLBACK: SiteContact = {
  phone: CONTACT.phone,
  phoneDisplay: CONTACT.phoneDisplay,
  zalo: CONTACT.zalo,
  email: CONTACT.email,
  addresses: CONTACT.addresses,
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
