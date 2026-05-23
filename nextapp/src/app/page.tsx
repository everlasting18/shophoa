import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import pb from "@/services/pocketbase";
import type { Product, Banner, Category } from "@/schema";
import HeroBanner from "@/components/home/hero-banner";
import CategoryCircles from "@/components/home/category-circles";
import ProductSection from "@/components/home/product-section";
import { getSiteSettings } from "@/services/settings";
import { localBusinessSchema, websiteSchema } from "@/services/seo";
import type { PostMeta } from "@/lib/posts";
import postsManifest from "@/content/posts-manifest.json";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  keywords: [
    "đặt hoa tươi TPHCM", "shop hoa tươi TPHCM", "hoa sinh nhật TPHCM",
    "hoa khai trương", "hoa tốt nghiệp", "điện hoa hỏa tốc 60 phút",
    "tiệm hoa nhà tình", "hoa tươi quận 3", "đặt hoa online",
  ],
  openGraph: {
    images: [{ url: "/images/banner1.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    images: ["/images/banner1.jpg"],
  },
};

async function getBanners(): Promise<Banner[]> {
  try {
    const res = await pb.collection("banners").getList<Banner>(1, 5, {
      filter: "is_active=true",
      sort: "sort_order",
    });
    return res.items;
  } catch { return []; }
}

async function getBestSellers(): Promise<Product[]> {
  try {
    const res = await pb.collection("products").getList<Product>(1, 12, {
      filter: "is_best_seller=true && is_active=true",
      sort: "-created",
    });
    return res.items;
  } catch { return []; }
}

async function getParentCategories(): Promise<Category[]> {
  try {
    return await pb.collection("categories").getFullList<Category>({
      filter: 'parent="" && is_active=true',
      sort: "sort_order",
    });
  } catch { return []; }
}

async function getFeaturedSections(
  categories: Category[]
): Promise<{ category: Category; products: Product[] }[]> {
  const featured = categories;
  if (featured.length === 0) return [];

  // Fetch all subcategories in one query
  const parentFilter = featured.map((c) => `parent="${c.id}"`).join(" || ");
  let subs: Category[] = [];
  try {
    subs = await pb.collection("categories").getFullList<Category>({
      filter: `(${parentFilter}) && is_active=true`,
    });
  } catch {}

  const subsByParent = new Map<string, string[]>();
  for (const sub of subs) {
    subsByParent.set(sub.parent, [...(subsByParent.get(sub.parent) ?? []), sub.id]);
  }

  // Fetch products for each category in parallel
  const sections = await Promise.all(
    featured.map(async (cat) => {
      const ids = [cat.id, ...(subsByParent.get(cat.id) ?? [])];
      const filter = `(${ids.map((id) => `categories~"${id}"`).join(" || ")}) && is_active=true`;
      try {
        const res = await pb.collection("products").getList<Product>(1, 10, {
          filter,
          sort: "-is_best_seller,-created",
        });
        return { category: cat, products: res.items };
      } catch {
        return { category: cat, products: [] };
      }
    })
  );

  return sections.filter((s) => s.products.length > 0);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function HomePage() {
  const [banners, bestSellers, parentCategories, contact] = await Promise.all([
    getBanners(),
    getBestSellers(),
    getParentCategories(),
    getSiteSettings(),
  ]);
  const latestPosts = postsManifest.slice(0, 3) as PostMeta[];

  const featuredSections = await getFeaturedSections(parentCategories);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(contact)) }}
      />

      {/* Hero */}
      <HeroBanner banners={banners} />

      {/* Category circles */}
      {parentCategories.length > 0 && (
        <CategoryCircles categories={parentCategories} />
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <ProductSection
          title="Bán Chạy Nhất"
          subtitle="Được yêu thích tuần này"
          href="/san-pham"
          products={bestSellers}
        />
      )}

      {/* Featured category sections */}
      {featuredSections.map(({ category, products }) => (
        <ProductSection
          key={category.id}
          title={category.name}
          href={`/${category.slug}`}
          products={products}
        />
      ))}

      

      {/* Blog preview */}
      {latestPosts.length > 0 && (
        <section className="py-14 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Góc Kiến Thức</p>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Bài Viết Mới</h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile/small-tablet: horizontal scroll — md+: grid inside container */}
          <div className="md:container md:mx-auto md:px-4">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 pb-2 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden shrink-0 w-[calc(50vw-24px)] snap-start md:w-auto md:shrink"
                >
                  {post.cover && (
                    <div className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden shrink-0">
                      <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-3 md:p-5">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2 md:gap-1.5 md:mb-3">
                        {post.tags.slice(0, 1).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] md:text-[11px] font-medium text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="font-heading font-semibold text-sm md:text-base leading-snug mb-1.5 md:mb-2 group-hover:text-primary transition-colors line-clamp-3 md:line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="hidden md:block text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-1">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground mt-auto pt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime} phút
                      </span>
                      <span aria-hidden>·</span>
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      
    </>
  );
}
