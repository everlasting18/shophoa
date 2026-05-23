import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import pb from "@/services/pocketbase";
import type { Product, Category } from "@/schema";
import ProductGallery from "@/components/product/product-gallery";
import AddToCartButton from "@/components/product/add-to-cart-button";
import ProductGrid from "@/components/product/product-grid";
import PriceDisplay from "@/components/product/price-display";
import { productSchema, breadcrumbSchema } from "@/services/seo";
import { getImageUrl } from "@/lib/media";
import { sanitizeHtml, stripHtml } from "@/lib/sanitize";
import { SITE_NAME, PHOTO_BASE } from "@/config";
import { getSiteSettings } from "@/services/settings";
import { Home, ChevronRight, Truck, ShieldCheck, Gift, Clock, Phone } from "lucide-react";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await pb.collection("products").getFirstListItem<Product>(
      `slug="${slug}" && is_active=true`,
      { expand: "categories" }
    );
  } catch {
    return null;
  }
}

async function getRelated(product: Product): Promise<Product[]> {
  try {
    if (!product.categories?.length) return [];
    const catFilter = product.categories.map((id) => `categories ~ "${id}"`).join(" || ");
    const res = await pb.collection("products").getList<Product>(1, 8, {
      filter: `(${catFilter}) && id != "${product.id}" && is_active=true`,
      sort: "-is_best_seller,-created",
    });
    return res.items;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Không tìm thấy" };

  const title = `${product.name} – Mua Tại ${SITE_NAME} TPHCM`;
  const description = stripHtml(product.short_description || product.description || "").slice(0, 155);
  const image = product.thumbnail
    ? `${PHOTO_BASE}/${product.collectionId}/${product.id}/${product.thumbnail}`
    : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/san-pham/${slug}` },
    openGraph: {
      title,
      description,
      url: `/san-pham/${slug}`,
      images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

const TRUST_BADGES = [
  { icon: Truck, text: "Giao hỏa tốc 60 phút" },
  { icon: ShieldCheck, text: "Hoa giống mẫu 100%" },
  { icon: Gift, text: "Thiệp viết tay miễn phí" },
  { icon: Clock, text: "Đặt trước 2 tiếng" },
];

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [related, contact] = await Promise.all([getRelated(product), getSiteSettings()]);

  const rawImages = Array.isArray(product.images) ? product.images : [];
  const seen = new Set<string>();
  const imageUrls: string[] = [];

  if (product.thumbnail) {
    const url = getImageUrl(product.collectionId, product.id, product.thumbnail, 800);
    imageUrls.push(url);
    seen.add(product.thumbnail);
  }

  for (const img of rawImages) {
    if (!seen.has(img)) {
      imageUrls.push(getImageUrl(product.collectionId, product.id, img, 800));
      seen.add(img);
    }
  }

  if (imageUrls.length === 0) imageUrls.push("/images/placeholder-flower.svg");

  const categories = (product.expand?.categories ?? []) as Category[];

  const discount =
    product.sale_price && product.price > 0
      ? Math.round((1 - product.sale_price / product.price) * 100)
      : 0;

  const breadcrumbs = [
    { name: "Trang chủ", href: "/" },
    ...(categories[0] ? [{ name: categories[0].name, href: `/${categories[0].slug}` }] : []),
    { name: product.name, href: `/san-pham/${slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }}
      />

      <div className="container mx-auto px-4 py-6 max-w-6xl pb-24 md:pb-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Trang chủ
          </Link>
          {categories[0] && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/${categories[0].slug}`} className="hover:text-primary transition-colors">
                {categories[0].name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16 items-start">
          <ProductGallery images={imageUrls} productName={product.name} />

          <div className="flex flex-col gap-5">
            {categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="text-[11px] px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary font-medium hover:bg-primary/10 hover:border-primary/50 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <div>
              <div className="flex gap-2 mb-2 flex-wrap">
                {product.is_best_seller && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-100">
                    🔥 Bán chạy
                  </span>
                )}

              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <PriceDisplay price={product.price} salePrice={product.sale_price} className="text-2xl sm:text-3xl" />
              {discount > 0 && (
                <span className="text-xs px-2.5 py-1 bg-red-50 text-red-600 font-bold rounded-full border border-red-100">
                  -{discount}%
                </span>
              )}
            </div>

            {product.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4 py-0.5">
                {product.short_description}
              </p>
            )}

            <AddToCartButton product={product} />

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground bg-background border border-border rounded-xl px-3 py-2.5">
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1 border-t border-border/60">
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>Hotline: <strong className="text-foreground">{contact.phoneDisplay}</strong></span>
              </a>
            </div>
          </div>
        </div>

        {product.description && (
          <div className="mb-14 max-w-3xl">
            <h2 className="font-heading text-lg font-bold mb-5 flex items-center gap-2.5">
              <span className="w-1 h-5 rounded-full bg-primary" />
              Mô tả sản phẩm
            </h2>
            <div
              className="prose prose-sm max-w-none text-foreground/80 leading-relaxed
                prose-headings:font-heading prose-headings:text-foreground
                prose-p:text-foreground/75 prose-p:leading-relaxed
                prose-img:rounded-xl prose-img:shadow-sm prose-img:my-4
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          </div>
        )}

        {related.length > 0 && (
          <div>
            <h2 className="font-heading text-lg font-bold mb-6 flex items-center gap-2.5">
              <span className="w-1 h-5 rounded-full bg-primary" />
              Có thể bạn thích
            </h2>
            <ProductGrid products={related} columns={4} />
          </div>
        )}
      </div>
    </>
  );
}
