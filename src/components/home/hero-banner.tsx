"use client";

import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Banner } from "@/lib/types";
import { CONTACT } from "@/lib/constants";

interface HeroBannerProps {
  banners: Banner[];
}

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;

const FALLBACK_SLIDES = [
  {
    title: "Tulip Hà Lan",
    subtitle: "Gửi Trọn Vẹn Yêu Thương",
    href: "/bo-hoa-tulip",
    bg: "from-rose-100 to-pink-50",
    accent: "text-rose-600",
  },
  {
    title: "Hoa Hồng Sophia",
    subtitle: "Ngọt Ngào Mỗi Ngày",
    href: "/hoa-hong-sophia",
    bg: "from-pink-100 to-rose-50",
    accent: "text-pink-600",
  },
  {
    title: "Hộp Hoa Mica",
    subtitle: "Xinh Xắn Nhẹ Nhàng",
    href: "/hop-hoa-mica",
    bg: "from-orange-50 to-rose-50",
    accent: "text-orange-500",
  },
];

export default function HeroBanner({ banners }: HeroBannerProps) {
  const hasBanners = banners.length > 0;

  if (hasBanners) {
    return (
      <section className="relative overflow-hidden">
        <Carousel className="w-full">
          <CarouselContent>
            {banners.map((banner) => {
              const imgUrl = `${PB_URL}/api/files/${banner.collectionId}/${banner.id}/${banner.image}`;
              return (
                <CarouselItem key={banner.id}>
                  <Link href={banner.link || "/"}>
                    <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] bg-muted">
                      <Image
                        src={imgUrl}
                        alt={banner.title}
                        fill
                        priority
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
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
      </section>
    );
  }

  return (
    <section className="overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          {FALLBACK_SLIDES.map((slide) => (
            <CarouselItem key={slide.href}>
              <div className={`bg-gradient-to-br ${slide.bg} min-h-[320px] sm:min-h-[420px] flex items-center`}>
                <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center gap-5">
                  <div className="text-5xl">🌸</div>
                  <h1 className={`font-heading text-3xl sm:text-5xl font-bold ${slide.accent}`}>
                    {slide.title}
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">{slide.subtitle}</p>
                  <div className="flex gap-3">
                    <Link
                      href={slide.href}
                      className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Xem Ngay
                    </Link>
                    <a
                      href={CONTACT.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-full border border-primary text-primary font-semibold hover:bg-accent transition-colors"
                    >
                      Đặt Qua Zalo
                    </a>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
}
