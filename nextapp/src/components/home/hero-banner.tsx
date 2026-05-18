"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import type { Banner } from "@/schema";
import { getImageUrl } from "@/lib/media";
import { ArrowRight } from "lucide-react";
import { CONTACT, NAV_ITEMS } from "@/config";

interface HeroBannerProps {
  banners: Banner[];
}

const FALLBACK_SLIDES = [
  {
    title: "Tulip Hà Lan",
    subtitle: "Gửi Trọn Vẹn Yêu Thương",
    desc: "Những bó tulip tươi thắm được nhập khẩu trực tiếp, thiết kế tinh tế cho mọi dịp đặc biệt.",
    href: "/bo-hoa-tulip",
    img: "/images/3.png",
    bg: "bg-[#4a5c3e]",
  },
  {
    title: "Hoa Hồng Sophia",
    subtitle: "Ngọt Ngào Mỗi Ngày",
    desc: "Hồng Ohara & Sophia nhập cao cấp, bó hoa sang trọng dành tặng người thương.",
    href: "/hoa-hong-sophia",
    img: "/images/3.png",
    bg: "bg-[#8a5a5a]",
  },
  {
    title: "Hộp Hoa Mica",
    subtitle: "Xinh Xắn Nhẹ Nhàng",
    desc: "Hộp hoa acrylic sang trọng, bảo quản hoa tươi lâu – món quà đầy ý nghĩa.",
    href: "/hop-hoa-mica",
    img: "/images/3.png",
    bg: "bg-[#b08b5e]",
  },
];

const INTERVAL = 5000;

const PRICE_RANGES = [
  { label: "Tất cả", value: "", min: 0, max: 0 },
  { label: "Dưới 300.000đ", value: "duoi-300k", min: 0, max: 300000 },
  { label: "300.000 – 500.000đ", value: "300k-500k", min: 300000, max: 500000 },
  { label: "500.000 – 1.000.000đ", value: "500k-1trieu", min: 500000, max: 1000000 },
  { label: "Trên 1.000.000đ", value: "tren-1trieu", min: 1000000, max: 0 },
];

function FlowerAdvisor() {
  const router = useRouter();
  const [topic, setTopic] = useState(NAV_ITEMS[0].href);
  const [price, setPrice] = useState("");

  function handleSearch() {
    const range = PRICE_RANGES.find((p) => p.value === price);
    const slug = topic.replace(/^\//, "");
    const params = new URLSearchParams();
    if (slug) params.set("categories", slug);
    if (range?.min) params.set("min", String(range.min));
    if (range?.max) params.set("max", String(range.max));
    router.push(`/san-pham?${params.toString()}`);
  }

  const selectCls = "w-full bg-white rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer";

  return (
    <div className="bg-primary">
      <div className="container mx-auto px-4 py-4">

        {/* Mobile layout */}
        <div className="sm:hidden space-y-2.5">
          <p className="text-white font-heading font-bold text-sm uppercase tracking-wide text-center">
            Tư vấn chọn hoa tươi
          </p>
          <div className="grid grid-cols-2 gap-2">
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className={selectCls}>
              {NAV_ITEMS.map((item) => (
                <option key={item.href} value={item.href}>{item.label}</option>
              ))}
            </select>
            <select value={price} onChange={(e) => setPrice(e.target.value)} className={selectCls}>
              {PRICE_RANGES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleSearch()}
            className="w-full bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-white font-heading font-bold text-sm lg:text-base uppercase tracking-wide whitespace-nowrap flex-shrink-0">
            Tư vấn chọn hoa tươi
          </span>
          <div className="flex flex-1 gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <label className="text-white/80 text-xs whitespace-nowrap flex-shrink-0">Chủ đề</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className={`flex-1 min-w-0 ${selectCls}`}>
                {NAV_ITEMS.map((item) => (
                  <option key={item.href} value={item.href}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <label className="text-white/80 text-xs whitespace-nowrap flex-shrink-0">Mức giá</label>
              <select value={price} onChange={(e) => setPrice(e.target.value)} className={`flex-1 min-w-0 ${selectCls}`}>
                {PRICE_RANGES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleSearch()}
              className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
            >
              Tìm kiếm
            </button>
          </div>
          <p className="text-white/70 text-xs whitespace-nowrap hidden xl:block flex-shrink-0">
            *Gọi{" "}
            <a href={`tel:${CONTACT.phone}`} className="text-amber-300 font-semibold hover:text-amber-200">
              {CONTACT.phoneDisplay}
            </a>{" "}
            để đặt theo thiết kế riêng
          </p>
        </div>

      </div>
    </div>
  );
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasBanners = banners.length > 0;
  const total = hasBanners ? banners.length : FALLBACK_SLIDES.length;

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => api?.scrollNext(), INTERVAL);
  }, [api]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => { setCurrent(api.selectedScrollSnap()); if (!paused) start(); };
    onSelect();
    api.on("select", onSelect);
    api.on("pointerDown", stop);
    api.on("pointerUp", () => { if (!paused) start(); });
    return () => { api.off("select", onSelect); stop(); };
  }, [api, paused, start, stop]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  const slides = hasBanners
    ? banners.map((banner) => ({
        key: banner.id,
        content: (
          <Link href={banner.link || "/"} className="block">
            <div className="relative w-full aspect-[4/3] sm:aspect-[3/1] bg-[#fdf6ee] overflow-hidden">
              <Image
                src={getImageUrl(banner.collectionId, banner.id, banner.image, 2400)}
                alt="Banner"
                fill
                priority
                className="object-cover object-left sm:object-center"
                sizes="100vw"
              />
            </div>
          </Link>
        ),
      }))
    : FALLBACK_SLIDES.map((slide) => ({
        key: slide.href,
        content: (
          <div className={`${slide.bg} aspect-[16/10] sm:aspect-[3/1] w-full flex items-center relative overflow-hidden`}>
            <Image src={slide.img} alt={slide.title} fill className="object-cover" priority />
            <div className="container mx-auto px-4 py-8 sm:py-16 flex flex-col items-center sm:items-end text-center sm:text-right gap-3 sm:gap-5 relative z-10">
              <div className="space-y-1">
                <p className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
                  {slide.subtitle}
                </p>
                <h1 className="font-heading text-xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-tight">
                  {slide.title}
                </h1>
              </div>
              <p className="text-primary/70 max-w-md text-[11px] sm:text-base leading-relaxed hidden sm:block">
                {slide.desc}
              </p>
              <div className="flex gap-2 sm:gap-3 mt-1">
                <Link
                  href={slide.href}
                  className="flex items-center gap-2 px-5 py-2 sm:px-8 sm:py-3 rounded-full bg-primary text-white text-xs sm:text-base font-semibold shadow-lg shadow-primary/20 transition-all group"
                >
                  Khám phá
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href={CONTACT.zalo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 sm:px-8 sm:py-3 rounded-full border border-primary/20 bg-white/50 backdrop-blur-sm text-primary text-xs sm:text-base font-semibold transition-all"
                >
                  Đặt Zalo
                </a>
              </div>
            </div>
          </div>
        ),
      }));

  return (
    <>
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.key}>
              {slide.content}
            </CarouselItem>
          ))}
        </CarouselContent>

        {total > 1 && (
          <>
            <CarouselPrevious className="left-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
            <CarouselNext className="right-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
          </>
        )}
      </Carousel>

      {total > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-[2px] rounded-full transition-all duration-500 ${
                i === current
                  ? "w-7 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
    <FlowerAdvisor />
    </>
  );
}
