import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, SOCIAL, PHOTO_BASE } from "@/config";
import { stripHtml } from "@/lib/sanitize";
import type { Product, Category, SiteContact } from "@/schema";

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "vi-VN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tim-kiem?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessSchema(contact: SiteContact) {
  const phoneE164 = `+84${contact.phone.replace(/^0/, "")}`;
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FloristShop"],
    "@id": `${SITE_URL}/#business`,
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
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "07:00",
        closes: "21:00",
      },
    ],
    priceRange: "₫₫",
    currenciesAccepted: "VND",
    paymentAccepted: "Cash, Bank Transfer",
    areaServed: { "@type": "City", name: "Thành phố Hồ Chí Minh" },
    image: `${SITE_URL}/images/LOGO2.png`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/LOGO2.png`,
    },
    sameAs: [SOCIAL.facebook, SOCIAL.instagram],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phoneE164,
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: "Vietnamese",
    },
  };
}

export function productSchema(product: Product) {
  const hasDiscount = (product.sale_price ?? 0) > 0 && product.sale_price! < product.price;
  const offerPrice = hasDiscount ? product.sale_price! : product.price;
  const imageUrl = product.thumbnail
    ? `${PHOTO_BASE}/${product.collectionId}/${product.id}/${product.thumbnail}`
    : `${SITE_URL}/images/placeholder-flower.svg`;
  const description = product.short_description || stripHtml(product.description || "");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/san-pham/${product.slug}/#product`,
    name: product.name,
    description,
    image: imageUrl,
    url: `${SITE_URL}/san-pham/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      price: offerPrice,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `${SITE_URL}/san-pham/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
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

export function categoryItemListSchema(category: Category, products: Product[]) {
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
