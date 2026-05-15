import type { Metadata } from "next";
import Link from "next/link";
import pb from "@/services/pocketbase";
import type { Product } from "@/schema";
import ProductGrid from "@/components/product/product-grid";
import Pagination from "@/components/category/pagination";
import SortSelect from "@/components/category/sort-select";
import { Flower2, Home, ChevronRight } from "lucide-react";
import { SITE_NAME } from "@/config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tất Cả Sản Phẩm",
  description: `Xem toàn bộ sản phẩm hoa tươi tại ${SITE_NAME}. Hoa sinh nhật, khai trương, tốt nghiệp và nhiều loại hoa tươi đẹp khác.`,
  alternates: { canonical: "/san-pham" },
};

const PER_PAGE = 20;

interface Props {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

async function getProducts(page: number, sort: string): Promise<{
  items: Product[];
  totalPages: number;
  totalItems: number;
}> {
  const sortMap: Record<string, string> = {
    newest: "-created",
    price_asc: "price",
    price_desc: "-price",
  };
  const sortField = sortMap[sort] || "-created";

  try {
    const res = await pb.collection("products").getList<Product>(page, PER_PAGE, {
      filter: "is_active=true",
      sort: sortField,
    });
    return { items: res.items, totalPages: res.totalPages, totalItems: res.totalItems };
  } catch {
    return { items: [], totalPages: 0, totalItems: 0 };
  }
}

export default async function AllProductsPage({ searchParams }: Props) {
  const { page: pageParam, sort = "newest" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1"));

  const { items, totalPages, totalItems } = await getProducts(page, sort);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Tất cả sản phẩm</span>
      </nav>

      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-6 tracking-tight">Tất Cả Sản Phẩm</h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">{totalItems} sản phẩm</p>
        <SortSelect current={sort} slug="san-pham" />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Flower2 className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium mb-1">Chưa có sản phẩm</p>
          <p className="text-muted-foreground text-sm">Cửa hàng đang được cập nhật sản phẩm. Vui lòng quay lại sau!</p>
        </div>
      ) : (
        <>
          <ProductGrid products={items} columns={4} />
          <Pagination totalPages={totalPages} currentPage={page} basePath="/san-pham" />
        </>
      )}
    </div>
  );
}
