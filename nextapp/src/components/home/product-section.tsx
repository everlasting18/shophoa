"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Product } from "@/schema";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  href: string;
  products: Product[];
  loading?: boolean;
}

export default function ProductSection({ title, subtitle, href, products, loading }: ProductSectionProps) {
  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="relative mb-8 flex flex-col items-center">
          <div className="text-center">
            {subtitle && (
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-[0.15em] mb-2 flex items-center justify-center gap-3">
                <span className="inline-block w-8 h-[1px] bg-primary/30" />
                {subtitle}
                <span className="inline-block w-8 h-[1px] bg-primary/30" />
              </p>
            )}
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {title}
            </h2>
          </div>
          <Link
            href={href}
            className="group mt-3 sm:mt-0 sm:absolute sm:right-0 sm:bottom-1.5 flex items-center gap-1.5 text-sm text-primary font-medium shrink-0 hover:gap-2 transition-all"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={5} />
        ) : (
          <Carousel
            opts={{ align: "start", loop: true, watchDrag: () => true }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4 sm:-ml-5">
              {products.map((product, i) => (
                <CarouselItem
                  key={product.id}
                  className="pl-4 sm:pl-5 basis-[48%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <ProductCard product={product} priority={i < 5} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Arrows: hidden on mobile, visible on sm+ */}
            <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-7 xl:-left-14 bg-white hover:bg-muted border-2 border-[#c9d4b8] text-black shadow-md sm:w-12 sm:h-12 z-10" />
            <CarouselNext className="hidden sm:flex -right-4 lg:-right-7 xl:-right-14 bg-white hover:bg-muted border-2 border-[#c9d4b8] text-black shadow-md sm:w-12 sm:h-12 z-10" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
