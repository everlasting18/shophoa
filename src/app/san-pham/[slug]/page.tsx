import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import pb from "@/lib/pocketbase";
import type { Product } from "@/lib/types";
import ProductGallery from "@/components/product/product-gallery";
import AddToCartButton from "@/components/product/add-to-cart-button";
import ProductGrid from "@/components/product/product-grid";
import PriceDisplay from "@/components/product/price-display";
import { productSchema, breadcrumbSchema, getProductImageUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 3600;

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL!;

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
    const res = await pb.collection("products").getList<Product>(1, 8, {
      filter: `categories?~"${product.categories[0]}" && id!="${product.id}" && is_active=true`,
      sort: "-is_best_seller,-view_count",
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

  const title = product.seo_title || `${product.name} | ${SITE_NAME}`;
  const description = product.seo_description || product.short_description;
  const image = product.thumbnail ? getProductImageUrl(product, product.thumbnail) : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/san-pham/${slug}` },
    openGraph: {
      title,
      description,
      url: `/san-pham/${slug}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelated(product);

  const rawImages = Array.isArray(product.images) ? product.images : [];
  const imageUrls: string[] = rawImages.map(
    (img) => `${PB_URL}/api/files/${product.collectionId}/${product.id}/${img}`
  );
  if (product.thumbnail && imageUrls.length === 0) {
    imageUrls.push(`${PB_URL}/api/files/${product.collectionId}/${product.id}/${product.thumbnail}`);
  }
  if (imageUrls.length === 0) {
    imageUrls.push("/images/placeholder-flower.svg");
  }

  const breadcrumbs = [
    { name: "Trang chủ", href: "/" },
    { name: "Sản phẩm", href: "/san-pham" },
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

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/san-pham" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Product main */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-14">
          {/* Gallery */}
          <ProductGallery images={imageUrls} productName={product.name} />

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {product.is_best_seller && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                  🔥 Bán chạy
                </span>
              )}
              {product.occasions?.map((occ) => (
                <span
                  key={occ}
                  className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground"
                >
                  {occ}
                </span>
              ))}
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold leading-snug">
              {product.name}
            </h1>

            <PriceDisplay price={product.price} salePrice={product.sale_price} className="text-2xl" />

            {product.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-3">
                {product.short_description}
              </p>
            )}

            <AddToCartButton product={product} />

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                ["🚀", "Giao hỏa tốc 60 phút"],
                ["✅", "Hoa giống mẫu 100%"],
                ["🎁", "Thiệp miễn phí"],
                ["🔒", "Thanh toán an toàn"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-14 max-w-3xl">
            <h2 className="font-heading text-xl font-bold mb-4">Mô tả sản phẩm</h2>
            <div
              className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-bold mb-6">Sản phẩm liên quan</h2>
            <ProductGrid products={related} columns={4} />
          </div>
        )}
      </div>
    </>
  );
}
