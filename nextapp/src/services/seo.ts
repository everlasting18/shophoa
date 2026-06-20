import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  SOCIAL,
  PHOTO_BASE,
  GEO,
  SERVICE_DISTRICTS,
  GMAPS_CHECKIN_URL,
} from "@/config";
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

// Suy ra opens/closes cho schema.org từ chuỗi giờ mở cửa tự do trong settings.
// Hỗ trợ: "08:00 – 21:00 mỗi ngày", "7h-21h", "24/24", "24/7"...
function parseOpeningHours(text: string): { opens: string; closes: string } {
  if (/24\s*\/\s*(24|7)/.test(text)) {
    return { opens: "00:00", closes: "23:59" };
  }
  const times = text.match(/(\d{1,2})(?::(\d{2}))?\s*h?/gi) ?? [];
  const norm = times
    .map((t) => {
      const m = t.match(/(\d{1,2})(?::(\d{2}))?/);
      if (!m) return null;
      const hh = m[1].padStart(2, "0");
      const mm = (m[2] ?? "00").padStart(2, "0");
      return Number(hh) <= 23 ? `${hh}:${mm}` : null;
    })
    .filter((v): v is string => v !== null);
  if (norm.length >= 2) return { opens: norm[0], closes: norm[1] };
  return { opens: "07:00", closes: "21:00" }; // fallback an toàn
}

export function localBusinessSchema(contact: SiteContact) {
  const phoneE164 = `+84${contact.phone.replace(/^0/, "")}`;
  const { opens, closes } = parseOpeningHours(contact.openingHours);
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
        opens,
        closes,
      },
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO.lat,
      longitude: GEO.lng,
    },
    hasMap: GMAPS_CHECKIN_URL,
    priceRange: "₫₫",
    currenciesAccepted: "VND",
    paymentAccepted: "Cash, Bank Transfer",
    areaServed: [
      { "@type": "City", name: "Thành phố Hồ Chí Minh" },
      ...SERVICE_DISTRICTS.map((d) => ({
        "@type": "AdministrativeArea",
        name: `${d}, Thành phố Hồ Chí Minh`,
      })),
    ],
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

  // Gộp thumbnail + ảnh gallery (loại trùng) → Google ưu tiên nhiều ảnh
  const imageFiles = Array.from(
    new Set([product.thumbnail, ...(product.images ?? [])].filter(Boolean)),
  );
  const images = imageFiles.length
    ? imageFiles.map((f) => `${PHOTO_BASE}/${product.collectionId}/${product.id}/${f}`)
    : [`${SITE_URL}/images/placeholder-flower.svg`];

  const description = product.short_description || stripHtml(product.description || "");

  // priceValidUntil cuốn chiếu 1 năm kể từ hôm nay (tránh warning của Google)
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/san-pham/${product.slug}/#product`,
    name: product.name.trim(),
    description,
    image: images,
    sku: product.id,
    url: `${SITE_URL}/san-pham/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      price: offerPrice,
      priceCurrency: "VND",
      priceValidUntil,
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
