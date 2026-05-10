"use client";

import { useState, useEffect } from "react";
import type { SiteContact } from "@/schema";
import { CONTACT } from "@/config";

const FALLBACK = {
  phone: CONTACT.phone,
  phoneDisplay: CONTACT.phoneDisplay,
  zalo: CONTACT.zalo,
};

export function useSettings() {
  const [contact, setContact] = useState({
    phone: FALLBACK.phone,
    phoneDisplay: FALLBACK.phoneDisplay,
    zalo: FALLBACK.zalo,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: SiteContact) => {
        setContact({
          phone: s.phone || FALLBACK.phone,
          phoneDisplay: s.phoneDisplay || FALLBACK.phoneDisplay,
          zalo: s.zalo || FALLBACK.zalo,
        });
      })
      .catch(() => {});
  }, []);

  return contact;
}
