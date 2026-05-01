import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, CONTACT } from "./constants";
import type { Product, Category } from "./types";

export function getProductImageUrl(
  product: Product,
  filename: string
): string {
  return `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${filename}`;
}

export function getBannerImageUrl(
  collectionId: string,
  recordId: string,
  filename: string
): string {
  return `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${collectionId}/${recordId}/${filename}`;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phone,
      contactType: "customer service",
    },
    address: CONTACT.addresses.map((a) => ({
      "@type": "PostalAddress",
      streetAddress: a,
    })),
    sameAs: [CONTACT.zalo],
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Florist",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: "₫₫",
    servesCuisine: "Hoa tươi",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "21:00",
    },
    location: CONTACT.addresses.map((a, i) => ({
      "@type": "Place",
      "@id": `${SITE_URL}/#location-${i}`,
      address: { "@type": "PostalAddress", streetAddress: a },
    })),
  };
}

export function productSchema(product: Product) {
  const price = product.sale_price ?? product.price;
  const imageUrl = product.thumbnail
    ? getProductImageUrl(product, product.thumbnail)
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
