"use client";

import Image from "next/image";
import { Phone } from "lucide-react";
import { CONTACT } from "@/lib/constants";

export default function ZaloFloat() {
  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3">
      {/* Zalo button */}
      <a
        href={CONTACT.zalo}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo"
        className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 overflow-hidden"
      >
        <Image
          src="/icons/zalo.svg"
          alt="Zalo"
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </a>

      {/* Hotline button */}
      <a
        href={`tel:${CONTACT.phone}`}
        aria-label={`Gọi ${CONTACT.phoneDisplay}`}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95 animate-pulse"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
}
