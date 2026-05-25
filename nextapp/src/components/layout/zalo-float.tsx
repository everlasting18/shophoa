"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Phone, MessageCircle, Tag, X, Gift } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

export default function ZaloFloat() {
  const contact = useSettings();
  const pathname = usePathname();
  const [phoneOpen, setPhoneOpen] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!phoneOpen) return;
    function handleClick(e: MouseEvent) {
      if (phoneRef.current && !phoneRef.current.contains(e.target as Node)) {
        setPhoneOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [phoneOpen]);

  if (pathname?.startsWith("/dat-hoa")) return null;

  const showMiniGame = !pathname?.startsWith("/checkin");

  const isProductDetail = /^\/san-pham\/.+/.test(pathname ?? "");
  const hasTwo = !!contact.phone2;

  return (
    <div className={`fixed ${isProductDetail ? "bottom-[76px] md:bottom-5" : "bottom-5"} right-4 z-50 flex flex-col gap-3 items-end`}>
      {/* Mini game button */}
      {showMiniGame && (
        <a href="/checkin" className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white bg-rose-500 px-4 py-2 rounded-full shadow-lg whitespace-nowrap hover:bg-rose-600 transition-colors active:scale-95">
            Mini game
          </span>
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 transition-transform hover:scale-110 active:scale-95">
            <Gift className="w-5 h-5" />
          </span>
        </a>
      )}

      {/* Báo giá button */}
      {contact.zaloGroup && (
        <a
          href={contact.zaloGroup}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Giá hoa mỗi ngày"
          className="flex items-center gap-2"
        >
          <span className="text-xs font-semibold text-white bg-primary px-4 py-2 rounded-full shadow-lg whitespace-nowrap hover:bg-primary/90 transition-colors active:scale-95">
            Giá hoa mỗi ngày
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

      {/* Hotline button — popup khi có 2 số */}
      <div ref={phoneRef} className="relative flex items-center gap-2">
        {/* Popup 2 số */}
        {phoneOpen && hasTwo && (
          <div className="absolute bottom-full mb-3 right-0 bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden w-56 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Gọi ngay</p>
              <button onClick={() => setPhoneOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <a
              href={`tel:${contact.phone}`}
              onClick={() => setPhoneOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
            >
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium">{contact.phoneDisplay}</span>
            </a>
            <a
              href={`tel:${contact.phone2}`}
              onClick={() => setPhoneOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors border-t border-border/40"
            >
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium">{contact.phone2Display || contact.phone2}</span>
            </a>
          </div>
        )}

        {hasTwo ? (
          /* Toggle popup khi có 2 số */
          <button
            onClick={() => setPhoneOpen((v) => !v)}
            aria-label="Gọi hotline"
            className="flex items-center gap-2"
          >
            <span className="text-xs font-medium text-foreground bg-white px-3 py-1.5 rounded-full shadow-md border border-border/60 whitespace-nowrap">
              Gọi ngay
            </span>
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95 animate-pulse">
              <Phone className="w-5 h-5" />
            </span>
          </button>
        ) : (
          /* Direct call khi chỉ có 1 số */
          <a href={`tel:${contact.phone}`} aria-label={`Gọi ${contact.phoneDisplay}`} className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground bg-white px-3 py-1.5 rounded-full shadow-md border border-border/60 whitespace-nowrap">
              Gọi ngay
            </span>
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95 animate-pulse">
              <Phone className="w-5 h-5" />
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
