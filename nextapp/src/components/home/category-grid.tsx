"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Category, Product } from "@/schema";
import { getThumbUrl } from "@/lib/media";
import ProductCard from "@/components/product/product-card";

const SHOW_DEFAULT = 8;

interface Props {
  categories: Category[];
  products: Product[];
}

export default function CategoryGrid({ categories, products }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const activeCategory = categories.find((c) => c.id === activeId) ?? null;

  const filtered = activeId === null
    ? products
    : products.filter((p) => Array.isArray(p.categories) && p.categories.includes(activeId));

  const visible = showAll ? filtered : filtered.slice(0, SHOW_DEFAULT);
  const hasMore = filtered.length > SHOW_DEFAULT && !showAll;

  function handleSelect(id: string | null) {
    setActiveId(id);
    setShowAll(false);
  }

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">

        {/* Category circles */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-3 scrollbar-hide sm:justify-center">
          {/* All */}
          <button
            onClick={() => handleSelect(null)}
            className="group flex flex-col items-center gap-2 shrink-0"
          >
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-muted ${
              activeId === null ? "border-primary shadow-md shadow-primary/20 scale-105" : "border-border"
            }`}>
              <span className="text-xl">🌸</span>
            </div>
            <p className={`text-xs sm:text-sm font-semibold text-center leading-tight w-20 sm:w-24 transition-colors ${
              activeId === null ? "text-primary" : "text-foreground"
            }`}>
              Tất cả
            </p>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className="group flex flex-col items-center gap-2 shrink-0"
            >
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 transition-all duration-300 relative bg-muted ${
                activeId === cat.id ? "border-primary shadow-md shadow-primary/20 scale-105" : "border-border"
              }`}>
                {cat.image ? (
                  <Image
                    src={getThumbUrl(cat.collectionId, cat.id, cat.image, "480x480")}
                    alt={cat.name}
                    fill
                    sizes="96px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
              </div>
              <p className={`text-xs sm:text-sm font-semibold text-center leading-tight w-20 sm:w-24 transition-colors ${
                activeId === cat.id ? "text-primary" : "text-foreground"
              }`}>
                {cat.name}
              </p>
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="mt-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Chưa có sản phẩm trong danh mục này.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {visible.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                {hasMore && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="px-6 py-2.5 rounded-full border border-border text-sm font-semibold hover:border-primary/40 hover:text-primary transition-all"
                  >
                    Xem thêm ({filtered.length - SHOW_DEFAULT} sản phẩm)
                  </button>
                )}
                <Link
                  href={activeCategory ? `/${activeCategory.slug}` : "/san-pham"}
                  className="group inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:gap-2 transition-all"
                >
                  Xem tất cả {activeCategory ? activeCategory.name.toLowerCase() : "sản phẩm"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </section>
  );
}
