import type { MetadataRoute } from "next";
import pb from "@/services/pocketbase";
import type { Product, Category } from "@/schema";
import { SITE_URL } from "@/config";
import postsManifest from "@/content/posts-manifest.json";

export const revalidate = 3600;

const BASE_URL = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...postsManifest.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/san-pham`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/lien-he`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/gioi-thieu`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/chinh-sach-bao-mat`, changeFrequency: "monthly", priority: 0.3 },
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

  return [...staticRoutes, ...blogRoutes, ...categoryRoutes, ...productRoutes];
}
