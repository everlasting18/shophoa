import ProductCard from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/schema";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

const colClass = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  return (
    <div className={`grid ${colClass[columns]} gap-4 sm:gap-5`}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 8} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 overflow-hidden bg-white">
          <Skeleton className="aspect-square w-full" />
          <div className="p-3.5 space-y-2.5">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
