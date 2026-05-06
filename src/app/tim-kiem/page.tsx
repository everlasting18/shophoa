import type { Metadata } from "next";
import Link from "next/link";
import { Search, Home, ChevronRight, Flower2, X } from "lucide-react";
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
      sort: "-is_best_seller,-created",
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Tìm kiếm</span>
      </nav>

      {/* Search bar */}
      <form method="GET" className="mb-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Tìm hoa sinh nhật, tulip, hoa hồng..."
            className="w-full pl-11 pr-10 py-3 rounded-full border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
            autoFocus
          />
          {q && (
            <Link
              href="/tim-kiem"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </Link>
          )}
        </div>
      </form>

      {q ? (
        <>
          <div className="mb-6">
            <h1 className="font-heading text-xl sm:text-2xl font-bold mb-1">
              Kết quả cho &ldquo;{q}&rdquo;
            </h1>
            <p className="text-sm text-muted-foreground">
              Tìm thấy {results.length} sản phẩm
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                Với từ khóa &ldquo;{q}&rdquo;. Hãy thử tìm kiếm khác nhé!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Hoa sinh nhật", "Hoa tulip", "Hoa hồng", "Hộp hoa mica"].map((s) => (
                  <Link
                    key={s}
                    href={`/tim-kiem?q=${encodeURIComponent(s)}`}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-border text-xs text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <ProductGrid products={results} columns={4} />
          )}
        </>
      ) : (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Flower2 className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium mb-1">Nhập từ khóa để tìm kiếm</p>
          <p className="text-muted-foreground text-sm">Tìm theo tên hoa, loại hoa, hoặc dịp tặng...</p>
        </div>
      )}
    </div>
  );
}
