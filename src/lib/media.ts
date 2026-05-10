import { IS_PROD, PB_URL, CF_IMAGE_BASE } from "@/config";
import type { CfImageOptions } from "@/schema";

const OPTIMIZE = IS_PROD;

function cfImage(url: string, options: CfImageOptions = {}): string {
  if (!url) return "";
  if (!OPTIMIZE) return url;

  const params = Object.entries(options)
    .map(([k, v]) => `${k}=${v}`)
    .join(",");

  return `${CF_IMAGE_BASE}/${params}/${url}`;
}

function withOptimized(rawUrl: string, width?: number): string {
  return cfImage(rawUrl, { width, format: "auto" });
}

export function getThumbUrl(collectionId: string, recordId: string, thumbnail: unknown, size = "480x480"): string {
  if (!thumbnail || typeof thumbnail !== "string") return "/images/placeholder-flower.svg";
  const raw = `${PB_URL}/api/files/${collectionId}/${recordId}/${thumbnail}?thumb=${size}`;
  const width = parseInt(size.split("x")[0], 10) || undefined;
  return withOptimized(raw, width);
}

export function getImageUrl(collectionId: string, recordId: string, filename: string, width?: number): string {
  const raw = `${PB_URL}/api/files/${collectionId}/${recordId}/${filename}`;
  return withOptimized(raw, width);
}
