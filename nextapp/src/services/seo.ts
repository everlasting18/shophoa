import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, SOCIAL } from "@/config";
import type { Product, Category, SiteContact } from "@/schema";
import { getImageUrl } from "@/lib/media";

export function localBusinessSchema(contact: SiteContact) {
  const phoneE164 = `+84${contact.phone.replace(/^0/, "")}`;
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FloristShop"],
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: phoneE164,
    email: contact.email,
    address: contact.addresses.map((addr) => ({
      "@type": "PostalAddress",
      streetAddress: addr,
      addressLocality: "Thành phố Hồ Chí Minh",
      addressRegion: "Hồ Chí Minh",
      addressCountry: "VN",
    })),
    openingHours: "Mo-Su 08:00-21:00",
    priceRange: "₫₫",
    areaServed: { "@type": "City", name: "Thành phố Hồ Chí Minh" },
    image: `${SITE_URL}/images/LOGO2.png`,
    sameAs: [SOCIAL.facebook, SOCIAL.instagram],
  };
}

export function productSchema(product: Product) {
  const price = product.sale_price ?? product.price;
  const imageUrl = product.thumbnail
    ? getImageUrl(product.collectionId, product.id, product.thumbnail)
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
