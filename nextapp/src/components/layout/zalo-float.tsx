"use client";

import { usePathname } from "next/navigation";
import { Phone, MessageCircle, Tag } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

export default function ZaloFloat() {
  const contact = useSettings();
  const pathname = usePathname();

  if (pathname?.startsWith("/dat-hoa")) {
    return null;
  }

  const isProductDetail = /^\/san-pham\/.+/.test(pathname ?? "");

  return (
    <div className={`fixed ${isProductDetail ? "bottom-[76px] md:bottom-5" : "bottom-5"} right-4 z-50 flex flex-col gap-3 items-end`}>
      {/* Báo giá button */}
      {contact.zaloGroup && (
        <a
          href={contact.zaloGroup}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Báo giá"
          className="flex items-center gap-2"
        >
          <span className="text-xs font-semibold text-white bg-primary px-4 py-2 rounded-full shadow-lg whitespace-nowrap hover:bg-primary/90 transition-colors active:scale-95">
            Báo giá
          </span>
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
            <Tag className="w-5 h-5" />
          </span>
        </a>
      )}

      {/* Zalo button */}
      <a
        href={contact.zalo}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo"
        className="flex items-center gap-2"
      >
        <span className="text-xs font-medium text-foreground bg-white px-3 py-1.5 rounded-full shadow-md border border-border/60 whitespace-nowrap">
          Chat Zalo
        </span>
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0068FF] text-white shadow-lg shadow-blue-500/20 transition-transform hover:scale-110 active:scale-95">
          <MessageCircle className="w-6 h-6" />
        </span>
      </a>

      {/* Hotline button */}
      <a
        href={`tel:${contact.phone}`}
        aria-label={`Gọi ${contact.phoneDisplay}`}
        className="flex items-center gap-2"
      >
        <span className="text-xs font-medium text-foreground bg-white px-3 py-1.5 rounded-full shadow-md border border-border/60 whitespace-nowrap">
          {contact.phoneDisplay || "Gọi ngay"}
        </span>
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95 animate-pulse">
          <Phone className="w-5 h-5" />
        </span>
      </a>
    </div>
  );
}
