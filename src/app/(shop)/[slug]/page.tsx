import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import pb from "@/lib/pocketbase";
import type { Category, Product } from "@/lib/types";
import ProductGrid from "@/components/product/product-grid";
import Pagination from "@/components/category/pagination";
import { breadcrumbSchema, categoryItemListSchema } from "@/lib/seo";
import { SITE_NAME } from "@/lib/constants";

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

async function getProducts(
  categoryId: string,
  page: number,
  sort: string
): Promise<{ items: Product[]; totalPages: number; totalItems: number }> {
  const sortMap: Record<string, string> = {
    newest: "-created",
    price_asc: "price",
    price_desc: "-price",
    popular: "-view_count",
  };
  const sortField = sortMap[sort] || "-created";

  try {
    const res = await pb.collection("products").getList<Product>(page, PER_PAGE, {
      filter: `categories~"${categoryId}" && is_active=true`,
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

  const title = category.seo_title || `${category.name} | ${SITE_NAME}`;
  const description = category.seo_description || category.description;

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

  const { items, totalPages, totalItems } = await getProducts(category.id, page, sort);

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
      <section className="bg-accent/50 py-8 border-b border-border">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground text-sm max-w-2xl">{category.description}</p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {totalItems} sản phẩm
          </p>
          <SortSelect current={sort} slug={slug} page={page} />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-4xl mb-4">🌸</div>
            <p>Chưa có sản phẩm trong danh mục này.</p>
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
          <div className="mt-12 pt-8 border-t border-border max-w-3xl">
            <h2 className="font-heading text-lg font-semibold mb-3">{category.name} – {SITE_NAME}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
          </div>
        )}
      </div>
    </>
  );
}

function SortSelect({ current, slug }: { current: string; slug: string; page?: number }) {
  const options = [
    { value: "newest", label: "Mới nhất" },
    { value: "popular", label: "Bán chạy" },
    { value: "price_asc", label: "Giá thấp → cao" },
    { value: "price_desc", label: "Giá cao → thấp" },
  ];

  return (
    <form method="GET">
      <select
        name="sort"
        defaultValue={current}
        onChange={(e) => {
          const url = `/${slug}?sort=${e.target.value}&page=1`;
          if (typeof window !== "undefined") window.location.href = url;
        }}
        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </form>
  );
}
