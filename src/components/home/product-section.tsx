import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductGrid, { ProductGridSkeleton } from "@/components/product/product-grid";
import type { Product } from "@/lib/types";

interface ProductSectionProps {
  title: string;
  href: string;
  products: Product[];
  loading?: boolean;
}

export default function ProductSection({ title, href, products, loading }: ProductSectionProps) {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl sm:text-2xl font-bold">{title}</h2>
          <Link
            href={href}
            className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
          >
            Xem thêm <ChevronRight className="w-4 h-4" />
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
