"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, ImageOff, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number>(0);

  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setActive((i) => (i - 1 + images.length) % images.length), [images.length]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
        <ImageOff className="w-12 h-12 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 lg:sticky lg:top-[88px]">
        {/* Main image */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border/40 cursor-zoom-in group select-none"
          onClick={() => setLightboxOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[active]}
            alt={`${productName} – ảnh ${active + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />

          {/* Zoom hint desktop */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
            <ZoomIn className="w-4 h-4 text-white" />
          </div>

          {/* Prev/Next arrows mobile */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow text-foreground/80 sm:hidden"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow text-foreground/80 sm:hidden"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Ảnh sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dot indicators mobile */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:hidden">
              {images.map((_, i) => (
                <span key={i} className={`h-1 rounded-full transition-all duration-300 ${i === active ? "w-4 bg-white" : "w-1 bg-white/60"}`} />
              ))}
            </div>
          )}

          {/* Count badge desktop */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full hidden sm:block">
              {active + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-muted",
                  i === active
                    ? "border-primary shadow-sm scale-105"
                    : "border-transparent hover:border-border"
                )}
              >
                <Image src={src} alt={`${productName} ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={() => setLightboxOpen(false)}
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Sau"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="relative w-[90vw] h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[active]}
              alt={`${productName} – ảnh ${active + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                  aria-label={`Xem ảnh ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
