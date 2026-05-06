import type { MetadataRoute } from "next";
import pb from "@/lib/pocketbase";
import type { Product, Category } from "@/lib/types";

const BASE_URL = "https://vuonhoatuoi.vn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/hoa-sinh-nhat`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/hoa-khai-truong`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/hoa-tot-nghiep`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/bo-hoa-tuoi`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/hop-hoa-mica`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/hoa-tinh-yeu`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/lien-he`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/gioi-thieu`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const categories = await pb.collection("categories").getFullList<Category>({
      filter: "is_active=true",
    });
    categoryRoutes = categories.map((cat) => ({
      url: `${BASE_URL}/${cat.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
    }));
  } catch {
    // PocketBase unreachable at build time — skip
  }

  try {
    const products = await pb.collection("products").getFullList<Product>({
      filter: "is_active=true",
      fields: "slug,updated,created",
    });
    productRoutes = products.map((p) => ({
      url: `${BASE_URL}/san-pham/${p.slug}`,
      lastModified: p.updated ? new Date(p.updated) : new Date(p.created),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // PocketBase unreachable at build time — skip
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
