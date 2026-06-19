"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Phone, MessageCircle, Tag, X, Gift } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.078 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

export default function ZaloFloat() {
  const contact = useSettings();
  const pathname = usePathname();
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!chatOpen) return;
    function handleClick(e: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setChatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [chatOpen]);

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

      {/* Chat group — Zalo + WhatsApp, sổ ra khi bấm */}
      <div ref={chatRef} className="relative flex items-center gap-2">
        {/* Popup các kênh chat */}
        {chatOpen && (
          <div className="absolute bottom-full mb-3 right-0 bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden w-56 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Chat ngay</p>
              <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <a
              href={contact.zalo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setChatOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0068FF] text-white shrink-0">
                <MessageCircle className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium">Chat Zalo</span>
            </a>
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setChatOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors border-t border-border/40"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#25D366] text-white shrink-0">
                <WhatsAppIcon className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium">Chat WhatsApp</span>
            </a>
          </div>
        )}

        <button
          onClick={() => setChatOpen((v) => !v)}
          aria-label="Chat ngay"
          aria-expanded={chatOpen}
          className="flex items-center gap-2"
        >
          <span className="text-xs font-medium text-foreground bg-white px-3 py-1.5 rounded-full shadow-md border border-border/60 whitespace-nowrap">
            Chat ngay
          </span>
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0068FF] text-white shadow-lg shadow-blue-500/20 transition-transform hover:scale-110 active:scale-95">
            <MessageCircle className="w-6 h-6" />
          </span>
        </button>
      </div>

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
