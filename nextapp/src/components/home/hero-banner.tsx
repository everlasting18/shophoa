"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import type { Banner, NavItem } from "@/schema";
import { getImageUrl } from "@/lib/media";
import { NAV_ITEMS } from "@/config";

const PRICE_RANGES = [
  { label: "Tất cả", value: "" },
  { label: "Dưới 150.000đ", value: "0-150000" },
  { label: "Dưới 300.000đ", value: "0-300000" },
  { label: "300.000 – 500.000đ", value: "300000-500000" },
  { label: "500.000 – 1.000.000đ", value: "500000-1000000" },
  { label: "Trên 1.000.000đ", value: "1000000-" },
];

function SearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [navItems, setNavItems] = useState<NavItem[]>(NAV_ITEMS);
  const [theme, setTheme] = useState(NAV_ITEMS[0]?.href ?? "");

  useEffect(() => {
    fetch("/api/navigation")
      .then((r) => r.json())
      .then((data: NavItem[]) => {
        if (data.length > 0) {
          setNavItems(data);
          setTheme(data[0].href);
        }
      })
      .catch(() => {});
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();
    if (price) {
      const [min, max] = price.split("-");
      if (min) params.set("min", min);
      if (max) params.set("max", max);
    }
    const qs = params.size ? `?${params}` : "";
    router.push(theme ? `${theme}${qs}` : `/san-pham${qs}`);
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 sm:items-end">
        <div className="flex flex-col gap-1 sm:flex-1">
          <label className="text-white/80 text-xs font-medium pl-0.5">Chủ đề</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full bg-white text-foreground text-sm rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 focus:outline-none"
          >
            {navItems.map((n) => (
              <option key={n.href} value={n.href}>{n.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 sm:flex-1">
          <label className="text-white/80 text-xs font-medium pl-0.5">Mức giá</label>
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-white text-foreground text-sm rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 focus:outline-none"
          >
            {PRICE_RANGES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="col-span-2 w-full sm:w-auto sm:shrink-0 bg-amber-400 text-white px-6 py-2 sm:py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-500 active:scale-95 transition-all"
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
}

interface HeroBannerProps {
  banners: Banner[];
}

type FallbackSlide = { title: string; href: string; img: string; bg: string };

const FALLBACK_SLIDES: FallbackSlide[] = [
  { title: "Tulip Hà Lan", href: "/bo-hoa-tulip", img: "/images/BN1.webp", bg: "bg-[#4a5c3e]" },
  { title: "Hoa Hồng Sophia", href: "/hoa-hong-sophia", img: "/images/banner2.webp", bg: "bg-[#8a5a5a]" },
  { title: "Hộp Hoa Mica", href: "/hop-hoa-mica", img: "/images/3.webp", bg: "bg-[#b08b5e]" },
];

const INTERVAL = 5000;

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasBanners = banners.length > 0;
  const total = hasBanners ? banners.length : FALLBACK_SLIDES.length;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => api?.scrollNext(), INTERVAL);
  }, [api]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
    startTimer();
    return () => stopTimer();
  }, [api, startTimer, stopTimer]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  const slides = hasBanners ? null : FALLBACK_SLIDES;

  return (
    <section onMouseEnter={stopTimer} onMouseLeave={startTimer}>
      {/* Image carousel */}
      <div className="relative overflow-hidden">
        <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {hasBanners
              ? banners.map((banner, i) => (
                  <CarouselItem key={banner.id}>
                    <div className="relative w-full aspect-[4/3] sm:aspect-[2.6/1] overflow-hidden">
                      {/* Mobile image */}
                      {banner.mobile_image && (
                        <Image
                          src={getImageUrl(banner.collectionId, banner.id, banner.mobile_image, 800)}
                          alt="Banner"
                          fill
                          priority={i === 0}
                          className="object-cover sm:hidden"
                          sizes="100vw"
                        />
                      )}
                      {/* Desktop image (also shown on mobile when no mobile_image) */}
                      <Image
                        src={getImageUrl(banner.collectionId, banner.id, banner.image, 2400)}
                        alt="Banner"
                        fill
                        priority={i === 0}
                        className={`object-cover ${banner.mobile_image ? "hidden sm:block" : ""}`}
                        sizes="100vw"
                      />
                    </div>
                  </CarouselItem>
                ))
              : slides!.map((slide) => (
                  <CarouselItem key={slide.href}>
                    <div className={`${slide.bg} aspect-[4/3] sm:aspect-[2.6/1] w-full relative overflow-hidden`}>
                      <Image src={slide.img} alt={slide.title} fill className="object-cover" priority />
                    </div>
                  </CarouselItem>
                ))
            }
          </CarouselContent>
          {total > 1 && (
            <>
              <CarouselPrevious className="left-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
              <CarouselNext className="right-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
            </>
          )}
        </Carousel>

        {/* Dots — desktop only, above the overlay */}
        {total > 1 && (
          <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2 z-10 hidden sm:flex gap-2.5">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => scrollTo(i)} aria-label={`Go to slide ${i + 1}`}
                className={`h-[2px] rounded-full transition-all duration-500 ${i === current ? "w-7 bg-white" : "w-2 bg-white/30 hover:bg-white/50"}`} />
            ))}
          </div>
        )}

        {/* Search form — desktop: overlay at bottom of image */}
        <SearchForm className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-2xl bg-[#A8B774]/90 backdrop-blur-sm rounded-2xl px-5 py-4" />
      </div>

      {/* Search form — mobile: below the image */}
      <SearchForm className="sm:hidden bg-[#A8B774] px-4 py-3" />
    </section>
  );
}