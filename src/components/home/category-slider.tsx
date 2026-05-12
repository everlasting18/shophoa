"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES = [
  {
    label: "HOA BÓ",
    count: "391 SẢN PHẨM",
    href: "/bo-hoa-tuoi",
    img: "https://images.unsplash.com/photo-1591880911020-d3496244400c?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "HOA LAN HỒ ĐIỆP",
    count: "294 SẢN PHẨM",
    href: "/hoa-lan-ho-diep",
    img: "https://images.unsplash.com/photo-1566996694954-90b052c413c4?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "HOA TANG LỄ",
    count: "154 SẢN PHẨM",
    href: "/tong-hop-hoa-chia-buon",
    img: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "GIỎ HOA CHÚC MỪNG",
    count: "701 SẢN PHẨM",
    href: "/gio-hoa-khai-truong",
    img: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "HOA CHÚC MỪNG",
    count: "344 SẢN PHẨM",
    href: "/hoa-khai-truong",
    img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "BÓ HOA BABY",
    count: "47 SẢN PHẨM",
    href: "/bo-hoa-baby",
    img: "https://images.unsplash.com/photo-1525310238294-79135a6438f2?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "HOA TÌNH YÊU",
    count: "285 SẢN PHẨM",
    href: "/hoa-tinh-yeu",
    img: "https://images.unsplash.com/photo-1548840410-ad9627443170?auto=format&fit=crop&w=400&q=80",
  },
];

export default function CategorySlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 20);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  return (
    <section className="py-4 sm:py-6 bg-transparent overflow-hidden">
      <div className="container mx-auto relative group/slider">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-10 overflow-x-auto px-6 pb-2 scrollbar-hide snap-x snap-mandatory items-start"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center gap-3 shrink-0 snap-center group w-[96px] sm:w-[130px]"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-white shadow-sm border border-black/5 transition-all duration-500 group-hover:shadow-md group-hover:scale-[1.03] group-hover:border-primary/20 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <img
                    src={cat.img}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-heading text-[10px] sm:text-[13px] font-bold text-foreground/90 tracking-tight leading-tight transition-colors group-hover:text-primary min-h-[2.4em] flex items-center justify-center">
                  {cat.label}
                </h3>
                <p className="text-[8px] sm:text-[10px] text-primary/60 font-medium tracking-tight uppercase">
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-[48px] sm:top-[64px] -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl border border-primary/10 flex items-center justify-center text-primary z-30 transition-all hover:scale-110 active:scale-95 ${showLeft ? "opacity-100 visible" : "opacity-0 invisible"}`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-[48px] sm:top-[64px] -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl border border-primary/10 flex items-center justify-center text-primary z-30 transition-all hover:scale-110 active:scale-95 ${showRight ? "opacity-100 visible" : "opacity-0 invisible"}`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
