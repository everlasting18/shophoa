import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductGrid, { ProductGridSkeleton } from "@/components/product/product-grid";
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
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            {subtitle && (
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1.5">
                <span className="inline-block w-4 h-px bg-primary/40" />
                {subtitle}
              </p>
            )}
            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
          <Link
            href={href}
            className="group flex items-center gap-1.5 text-sm text-primary font-medium shrink-0 hover:gap-2 transition-all"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <ProductGrid products={products.slice(0, 8)} columns={4} />
        )}
      </div>
    </section>
  );
}
