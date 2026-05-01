import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import pb from "@/lib/pocketbase";
import type { Product } from "@/lib/types";
import ProductGrid from "@/components/product/product-grid";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Kết quả tìm kiếm: "${q}"` : "Tìm kiếm",
    robots: { index: false, follow: false },
  };
}

async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  try {
    const res = await pb.collection("products").getList<Product>(1, 48, {
      filter: `(name~"${query}" || short_description~"${query}") && is_active=true`,
      sort: "-is_best_seller,-view_count",
    });
    return res.items;
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = await searchProducts(q);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search bar */}
      <form method="GET" className="mb-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Tìm hoa sinh nhật, tulip, hoa hồng..."
            className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            autoFocus
          />
        </div>
      </form>

      {q ? (
        <>
          <h1 className="font-heading text-xl font-bold mb-2">
            Kết quả cho &ldquo;{q}&rdquo;
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Tìm thấy {results.length} sản phẩm
          </p>

          {results.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-muted-foreground mb-4">
                Không tìm thấy sản phẩm phù hợp với &ldquo;{q}&rdquo;
              </p>
              <Link href="/" className="text-primary hover:underline text-sm">
                ← Xem tất cả sản phẩm
              </Link>
            </div>
          ) : (
            <ProductGrid products={results} columns={4} />
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-5xl mb-4">🌸</div>
          <p>Nhập từ khóa để tìm kiếm hoa</p>
        </div>
      )}
    </div>
  );
}
