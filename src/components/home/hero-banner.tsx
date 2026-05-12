"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import type { Banner } from "@/schema";
import { useSettings } from "@/hooks/use-settings";
import { getImageUrl } from "@/lib/media";
import { Flower2 } from "lucide-react";

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
    accent: "text-white",
    btn: "bg-white text-[#5d714f] hover:bg-white/90",
  },
  {
    title: "Hoa Hồng Sophia",
    subtitle: "Ngọt Ngào Mỗi Ngày",
    desc: "Hồng Ohara & Sophia nhập cao cấp, bó hoa sang trọng dành tặng người thương.",
    href: "/hoa-hong-sophia",
    img: "/images/3.png",
    bg: "bg-[#8a5a5a]",
    accent: "text-white",
    btn: "bg-white text-[#8a5a5a] hover:bg-white/90",
  },
  {
    title: "Hộp Hoa Mica",
    subtitle: "Xinh Xắn Nhẹ Nhàng",
    desc: "Hộp hoa acrylic sang trọng, bảo quản hoa tươi lâu – món quà đầy ý nghĩa.",
    href: "/hop-hoa-mica",
    img: "/images/3.png",
    bg: "bg-[#b08b5e]",
    accent: "text-white",
    btn: "bg-white text-[#b08b5e] hover:bg-white/90",
  },
];

export default function HeroBanner({ banners }: HeroBannerProps) {
  const contact = useSettings();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasBanners = banners.length > 0;

  useEffect(() => {
    if (!api) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    if (!api || paused) return;
    const timer = setInterval(() => api.scrollNext(), 4000);
    return () => clearInterval(timer);
  }, [api, paused]);

  const scrollTo = useCallback(
    (index: number) => api?.scrollTo(index),
    [api]
  );

  if (hasBanners) {
    return (
      <section
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {banners.map((banner, i) => {
              const imgUrl = getImageUrl(banner.collectionId, banner.id, banner.image, 2400);
              return (
                <CarouselItem key={banner.id}>
                  <Link href={banner.link || "/"} className="block">
                    <div className="relative w-full aspect-[3/1] bg-muted overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={banner.title}
                        fill
                        priority={i === 0}
                        className="object-cover"
                        sizes="100vw"
                      />
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          {banners.length > 1 && (
            <>
              <CarouselPrevious className="left-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
              <CarouselNext className="right-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white shadow-sm" : "w-1.5 bg-white/50 hover:bg-white/70"
                      }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </Carousel>
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {FALLBACK_SLIDES.map((slide) => (
            <CarouselItem key={slide.href}>
              <div className={`${slide.bg} aspect-[16/10] sm:aspect-[2.6/1] w-full flex items-center relative overflow-hidden`}>
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
                      className="px-5 py-2 sm:px-8 sm:py-3 rounded-full bg-primary text-white text-xs sm:text-base font-semibold shadow-lg shadow-primary/20 transition-all"
                    >
                      Xem Ngay
                    </Link>
                    <a
                      href={contact.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 sm:px-8 sm:py-3 rounded-full border border-primary/20 bg-white/50 backdrop-blur-sm text-primary text-xs sm:text-base font-semibold transition-all"
                    >
                      Đặt Zalo
                    </a>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
        <CarouselNext className="right-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {FALLBACK_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-foreground/60" : "w-1.5 bg-foreground/20 hover:bg-foreground/30"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
