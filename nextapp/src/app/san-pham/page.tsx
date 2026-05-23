import type { Metadata } from "next";
import Link from "next/link";
import pb from "@/services/pocketbase";
import type { Category, Product } from "@/schema";
import ProductGrid from "@/components/product/product-grid";
import Pagination from "@/components/category/pagination";
import SortSelect from "@/components/category/sort-select";
import FilterSidebar from "@/components/category/filter-sidebar";
import { Flower2, Home, ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { SITE_NAME } from "@/config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Mua Hoa Tươi Online TPHCM",
  description: `Toàn bộ hoa tươi tại ${SITE_NAME} TPHCM. Hoa sinh nhật, khai trương, tốt nghiệp, tình yêu – đặt online, giao hỏa tốc 60 phút nội thành.`,
  alternates: { canonical: "/san-pham" },
  openGraph: {
    title: "Mua Hoa Tươi Online TPHCM",
    images: [{ url: "/images/banner1.jpg", width: 1200, height: 630 }],
  },
};

const PER_PAGE = 20;

interface Props {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    categories?: string;
    min?: string;
    max?: string;
  }>;
}

async function getAllCategories(): Promise<Category[]> {
  try {
    return await pb.collection("categories").getFullList<Category>({
      filter: "is_active=true",
      sort: "sort_order",
    });
  } catch { return []; }
}

async function getCategoryIds(slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return [];
  try {
    const filter = slugs.map((s) => `slug="${s}"`).join(" || ");
    const cats = await pb.collection("categories").getFullList<Category>({
      filter: `(${filter}) && is_active=true`,
    });
    if (cats.length === 0) return [];
    const subFilter = cats.map((c) => `parent="${c.id}"`).join(" || ");
    const subs = await pb.collection("categories").getFullList<Category>({
      filter: `(${subFilter}) && is_active=true`,
    });
    return [...cats.map((c) => c.id), ...subs.map((s) => s.id)];
  } catch { return []; }
}

async function getProducts(
  page: number,
  sort: string,
  categorySlugs: string[],
  min?: number,
  max?: number,
): Promise<{ items: Product[]; totalPages: number; totalItems: number }> {
  const sortMap: Record<string, string> = {
    newest: "-created",
    price_asc: "price",
    price_desc: "-price",
  };
  const filters = ["is_active=true"];

  if (categorySlugs.length > 0) {
    const ids = await getCategoryIds(categorySlugs);
    if (ids.length > 0) {
      filters.push(`(${ids.map((id) => `categories ~ "${id}"`).join(" || ")})`);
    }
  }
  if (min) filters.push(`price>=${min}`);
  if (max) filters.push(`price<=${max}`);

  try {
    const res = await pb.collection("products").getList<Product>(page, PER_PAGE, {
      filter: filters.join(" && "),
      sort: sortMap[sort] || "-created",
    });
    return { items: res.items, totalPages: res.totalPages, totalItems: res.totalItems };
  } catch {
    return { items: [], totalPages: 0, totalItems: 0 };
  }
}

export default async function AllProductsPage({ searchParams }: Props) {
  const {
    page: pageParam,
    sort = "newest",
    categories = "",
    min = "",
    max = "",
  } = await searchParams;

  const page = Math.max(1, parseInt(pageParam || "1"));
  const categorySlugs = categories ? categories.split(",").filter(Boolean) : [];
  const minPrice = min ? parseInt(min) : undefined;
  const maxPrice = max ? parseInt(max) : undefined;

  const [allCategories, { items, totalPages, totalItems }] = await Promise.all([
    getAllCategories(),
    getProducts(page, sort, categorySlugs, minPrice, maxPrice),
  ]);

  const extraParams: Record<string, string> = {};
  if (categories) extraParams.categories = categories;
  if (min) extraParams.min = min;
  if (max) extraParams.max = max;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Trang chủ
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Tất cả sản phẩm</span>
      </nav>

      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-6 tracking-tight">
        Tất Cả Sản Phẩm
      </h1>

      <div className="flex gap-8 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24">
          <div className="bg-white border border-border rounded-xl p-5">
            <span className="font-semibold text-sm block mb-5">Bộ lọc</span>
            <FilterSidebar
              mode="sidebar"
              categories={allCategories}
              selectedCategories={categorySlugs}
              currentMin={min}
              currentMax={max}
              currentSort={sort}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <div className="lg:hidden">
                <FilterSidebar
                  mode="mobile"
                  categories={allCategories}
                  selectedCategories={categorySlugs}
                  currentMin={min}
                  currentMax={max}
                  currentSort={sort}
                />
              </div>
              <p className="text-sm text-muted-foreground">{totalItems} sản phẩm</p>
            </div>
            <Suspense><SortSelect current={sort} slug="san-pham" /></Suspense>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Flower2 className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">Không tìm thấy sản phẩm</p>
              <p className="text-muted-foreground text-sm">Thử thay đổi bộ lọc để xem thêm nhé!</p>
            </div>
          ) : (
            <>
              <ProductGrid products={items} columns={4} />
              <Pagination
                totalPages={totalPages}
                currentPage={page}
                basePath="/san-pham"
                sort={sort}
                extraParams={extraParams}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
