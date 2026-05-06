"use client";

import { useState, useEffect } from "react";
import type { SiteContact } from "@/lib/settings";

const FALLBACK = {
  phone: "0976491322",
  phoneDisplay: "0976.491.322",
  zalo: "https://zalo.me/0976491322",
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
