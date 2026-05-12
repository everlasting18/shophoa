import { SITE_NAME, SITE_URL } from "@/config";
import type { Product, Category } from "@/schema";
import { getImageUrl } from "@/lib/media";

export function getProductImageUrl(
  collectionId: string,
  recordId: string,
  filename: string
): string {
  return getImageUrl(collectionId, recordId, filename);
}

export function productSchema(product: Product) {
  const price = product.sale_price ?? product.price;
  const imageUrl = product.thumbnail
    ? getProductImageUrl(product.collectionId, product.id, product.thumbnail)
    : "";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description,
    image: imageUrl,
    url: `${SITE_URL}/san-pham/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; href: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

export function categoryItemListSchema(
  category: Category,
  products: Product[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    description: category.description,
    url: `${SITE_URL}/${category.slug}`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/san-pham/${p.slug}`,
      name: p.name,
    })),
  };
}
