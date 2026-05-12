"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import type { Banner } from "@/schema";
import { getImageUrl } from "@/lib/media";
import { ArrowRight } from "lucide-react";

interface HeroBannerProps {
  banners: Banner[];
}

const FALLBACK = [
  { label: "Tulip Hà Lan · Gửi Trọn Vẹn Yêu Thương", href: "/bo-hoa-tulip" },
  { label: "Hoa Hồng Sophia · Ngọt Ngào Mỗi Ngày", href: "/hoa-hong-sophia" },
  { label: "Hộp Hoa Mica · Xinh Xắn Nhẹ Nhàng", href: "/hop-hoa-mica" },
];

const INTERVAL = 5000;

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasBanners = banners.length > 0;
  const total = hasBanners ? banners.length : FALLBACK.length;

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => api?.scrollNext(), INTERVAL);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const on = () => { setCurrent(api.selectedScrollSnap()); start(); };
    on();
    api.on("select", on);
    api.on("pointerDown", () => timerRef.current && clearInterval(timerRef.current));
    api.on("pointerUp", start);
    return () => { api.off("select", on); if (timerRef.current) clearInterval(timerRef.current); };
  }, [api, start]);

  const go = (i: number) => { api?.scrollTo(i); start(); };

  if (hasBanners) {
    return (
      <section className="relative bg-stone-950">
        <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {banners.map((b, i) => (
              <CarouselItem key={b.id}>
                <Link href={b.link || "/"} className="block relative w-full aspect-[2] sm:aspect-[2.5] overflow-hidden">
                  <Image
                    src={getImageUrl(b.collectionId, b.id, b.image, 2400)}
                    alt=""
                    fill
                    priority={i === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {total > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-[2px] rounded-full transition-all duration-500 ${
                  i === current ? "w-7 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="bg-background">
      <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {FALLBACK.map((s) => (
            <CarouselItem key={s.href}>
              <div className="min-h-[420px] sm:min-h-[520px] flex items-center">
                <div className="container mx-auto px-6 max-w-3xl text-center">
                  <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-medium text-foreground tracking-tight leading-[1.15]">
                    {s.label}
                  </h1>
                  <div className="mt-8">
                    <Link
                      href={s.href}
                      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      Khám phá
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {total > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2.5">
          {FALLBACK.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-[2px] rounded-full transition-all duration-500 ${
                i === current ? "w-7 bg-foreground/40" : "w-2 bg-foreground/10 hover:bg-foreground/25"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
