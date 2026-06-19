import { cache } from "react";
import type { Settings, SiteContact } from "@/schema";
import { CONTACT, WHATSAPP_PHONE, whatsappLink } from "@/config";

const FALLBACK: SiteContact = {
  phone: CONTACT.phone,
  phoneDisplay: CONTACT.phoneDisplay,
  phone2: "",
  phone2Display: "",
  zalo: CONTACT.zalo,
  zaloGroup: "",
  whatsapp: whatsappLink(WHATSAPP_PHONE),
  email: CONTACT.email,
  addresses: CONTACT.addresses,
  openingHours: "08:00 – 21:00 mỗi ngày",
  freeShippingNote: "",
};

function mapSettings(records: Settings[]): SiteContact {
  const get = (key: string) => records.find((r) => r.key === key)?.value ?? "";

  const addresses = [get("address_1"), get("address_2")].filter(Boolean);
  if (addresses.length === 0) addresses.push(...FALLBACK.addresses);

  const hotlineDisplay = get("hotline_display") || FALLBACK.phoneDisplay;
  const displayParts = hotlineDisplay.split(/\s*[-–]\s*/).map((s) => s.trim()).filter(Boolean);

  // Cho phép admin nhập số điện thoại hoặc URL wa.me đầy đủ
  const whatsappRaw = get("whatsapp");
  const whatsapp = whatsappRaw
    ? whatsappRaw.startsWith("http")
      ? whatsappRaw
      : whatsappLink(whatsappRaw)
    : FALLBACK.whatsapp;

  return {
    phone: get("phone") || FALLBACK.phone,
    phoneDisplay: displayParts[0] || hotlineDisplay,
    phone2: displayParts[1] ? displayParts[1].replace(/\D/g, "") : "",
    phone2Display: displayParts[1] || "",
    zalo: get("zalo") || FALLBACK.zalo,
    zaloGroup: get("zalo_group"),
    whatsapp,
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
