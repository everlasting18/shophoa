"use client";

import { useState, useEffect } from "react";
import type { SiteContact } from "@/schema";
import { CONTACT, WHATSAPP_PHONE, whatsappLink } from "@/config";

const FALLBACK = {
  phone: CONTACT.phone,
  phoneDisplay: CONTACT.phoneDisplay,
  phone2: "",
  phone2Display: "",
  zalo: CONTACT.zalo,
  zaloGroup: "",
  whatsapp: whatsappLink(WHATSAPP_PHONE),
};

export function useSettings() {
  const [contact, setContact] = useState({
    phone: FALLBACK.phone,
    phoneDisplay: FALLBACK.phoneDisplay,
    phone2: FALLBACK.phone2,
    phone2Display: FALLBACK.phone2Display,
    zalo: FALLBACK.zalo,
    zaloGroup: FALLBACK.zaloGroup,
    whatsapp: FALLBACK.whatsapp,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: SiteContact) => {
        setContact({
          phone: s.phone || FALLBACK.phone,
          phoneDisplay: s.phoneDisplay || FALLBACK.phoneDisplay,
          phone2: s.phone2 || "",
          phone2Display: s.phone2Display || "",
          zalo: s.zalo || FALLBACK.zalo,
          zaloGroup: s.zaloGroup || FALLBACK.zaloGroup,
          whatsapp: s.whatsapp || FALLBACK.whatsapp,
        });
      })
      .catch(() => {});
  }, []);

  return contact;
}
