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
    bg: "bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50",
    accent: "text-rose-700",
    btn: "bg-rose-700 hover:bg-rose-800",
  },
  {
    title: "Hoa Hồng Sophia",
    subtitle: "Ngọt Ngào Mỗi Ngày",
    desc: "Hồng Ohara & Sophia nhập cao cấp, bó hoa sang trọng dành tặng ngườithương.",
    href: "/hoa-hong-sophia",
    bg: "bg-gradient-to-br from-pink-50 via-rose-50 to-red-50",
    accent: "text-pink-700",
    btn: "bg-pink-700 hover:bg-pink-800",
  },
  {
    title: "Hộp Hoa Mica",
    subtitle: "Xinh Xắn Nhẹ Nhàng",
    desc: "Hộp hoa acrylic sang trọng, bảo quản hoa tươi lâu – món quà đầy ý nghĩa.",
    href: "/hop-hoa-mica",
    bg: "bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50",
    accent: "text-orange-700",
    btn: "bg-orange-700 hover:bg-orange-800",
  },
];

export default function HeroBanner({ banners }: HeroBannerProps) {
  const contact = useSettings();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const hasBanners = banners.length > 0;

  useEffect(() => {
    if (!api) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => api?.scrollTo(index),
    [api]
  );

  if (hasBanners) {
    return (
      <section className="relative overflow-hidden">
        <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {banners.map((banner) => {
              const imgUrl = getImageUrl(banner.collectionId, banner.id, banner.image, 2400);
              return (
                <CarouselItem key={banner.id}>
                  <Link href={banner.link || "/"} className="block">
                    <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] bg-muted overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={banner.title}
                        fill
                        priority
                        className="object-cover hover:scale-[1.02] transition-transform duration-700"
                        sizes="100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
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
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === current ? "w-6 bg-white shadow-sm" : "w-1.5 bg-white/50 hover:bg-white/70"
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
    <section className="overflow-hidden">
      <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {FALLBACK_SLIDES.map((slide) => (
            <CarouselItem key={slide.href}>
              <div className={`${slide.bg} min-h-[340px] sm:min-h-[460px] flex items-center`}>
                <div className="container mx-auto px-4 py-14 sm:py-16 flex flex-col items-center text-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm mb-1">
                    <Flower2 className={`w-7 h-7 ${slide.accent}`} />
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm font-semibold uppercase tracking-widest ${slide.accent} opacity-80`}>
                      {slide.subtitle}
                    </p>
                    <h1 className={`font-heading text-3xl sm:text-5xl lg:text-6xl font-bold ${slide.accent} tracking-tight`}>
                      {slide.title}
                    </h1>
                  </div>
                  <p className="text-muted-foreground max-w-md text-sm sm:text-base leading-relaxed">
                    {slide.desc}
                  </p>
                  <div className="flex gap-3 mt-1">
                    <Link
                      href={slide.href}
                      className={`px-7 py-3 rounded-full text-white font-semibold shadow-lg shadow-rose-900/10 transition-all hover:shadow-xl hover:-translate-y-0.5 ${slide.btn}`}
                    >
                      Xem Ngay
                    </Link>
                    <a
                      href={contact.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-7 py-3 rounded-full border border-foreground/10 bg-white/70 backdrop-blur-sm text-foreground font-semibold hover:bg-white transition-all hover:-translate-y-0.5 shadow-sm"
                    >
                      Đặt Qua Zalo
                    </a>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
        <CarouselNext className="right-4 hidden sm:flex bg-white/90 hover:bg-white border-0 shadow-lg" />
        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {FALLBACK_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-foreground/60" : "w-1.5 bg-foreground/20 hover:bg-foreground/30"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
