import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import pb from "@/lib/pocketbase";
import type { Category, Product } from "@/lib/types";
import ProductGrid from "@/components/product/product-grid";
import Pagination from "@/components/category/pagination";
import SortSelect from "@/components/category/sort-select";
import { breadcrumbSchema, categoryItemListSchema } from "@/lib/seo";
import { SITE_NAME } from "@/lib/constants";
import { Home, ChevronRight, Flower2 } from "lucide-react";

export const revalidate = 3600;

const PER_PAGE = 24;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const res = await pb.collection("categories").getFirstListItem<Category>(
      `slug="${slug}" && is_active=true`
    );
    return res;
  } catch {
    return null;
  }
}

async function getSubcategories(parentId: string): Promise<Category[]> {
  try {
    const res = await pb.collection("categories").getList<Category>(1, 20, {
      filter: `parent="${parentId}" && is_active=true`,
      sort: "sort_order",
    });
    return res.items;
  } catch {
    return [];
  }
}

async function getProducts(
  categoryId: string,
  page: number,
  sort: string
): Promise<{ items: Product[]; totalPages: number; totalItems: number }> {
  const sortMap: Record<string, string> = {
    newest: "-created",
    price_asc: "price",
    price_desc: "-price",
  };
  const sortField = sortMap[sort] || "-created";

  try {
    const res = await pb.collection("products").getList<Product>(page, PER_PAGE, {
      filter: `categories?="${categoryId}" && is_active=true`,
      sort: sortField,
    });
    return {
      items: res.items,
      totalPages: res.totalPages,
      totalItems: res.totalItems,
    };
  } catch {
    return { items: [], totalPages: 0, totalItems: 0 };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Không tìm thấy" };

  const title = `${category.name} | ${SITE_NAME}`;
  const description = category.description;

  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: { title, description, url: `/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam, sort = "newest" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1"));

  const category = await getCategory(slug);
  if (!category) notFound();

  const [subcategories, { items, totalPages, totalItems }] = await Promise.all([
    getSubcategories(category.id),
    getProducts(category.id, page, sort),
  ]);

  const breadcrumbs = [
    { name: "Trang chủ", href: "/" },
    { name: category.name, href: `/${slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categoryItemListSchema(category, items)),
        }}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-accent/40 to-background py-10 border-b border-border/40">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Trang chủ
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2 tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">{category.description}</p>
          )}
          {subcategories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${sub.slug}`}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-full border border-border bg-white hover:border-primary/40 hover:bg-accent hover:text-primary transition-colors shadow-sm"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {totalItems} sản phẩm
          </p>
          <SortSelect current={sort} slug={slug} />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Flower2 className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium mb-1">Chưa có sản phẩm</p>
            <p className="text-muted-foreground text-sm">Danh mục này đang được cập nhật. Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <>
            <ProductGrid products={items} columns={4} />
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              basePath={`/${slug}`}
            />
          </>
        )}

        {/* SEO description */}
        {category.description && (
          <div className="mt-14 pt-8 border-t border-border max-w-3xl">
            <h2 className="font-heading text-lg font-semibold mb-3">{category.name} – {SITE_NAME}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
          </div>
        )}
      </div>
    </>
  );
}
