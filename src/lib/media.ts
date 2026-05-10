import { IS_PROD, PHOTO_BASE, CF_IMAGE_BASE } from "@/config";
import type { CfImageOptions } from "@/schema";

const OPTIMIZE = IS_PROD;

function cfImage(url: string, options: CfImageOptions = {}): string {
  if (!url) return "";
  if (!OPTIMIZE) return url;

  const params = Object.entries(options)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join(",");

  if (!params) return `${CF_IMAGE_BASE}/${url}`;
  return `${CF_IMAGE_BASE}/${params}/${url}`;
}

function withOptimized(rawUrl: string, width?: number): string {
  const opts: CfImageOptions = { format: "auto" };
  if (width) opts.width = width;
  return cfImage(rawUrl, opts);
}

export function getThumbUrl(collectionId: string, recordId: string, thumbnail: unknown, size = "480x480"): string {
  if (!thumbnail || typeof thumbnail !== "string") return "/images/placeholder-flower.svg";
  const raw = `${PHOTO_BASE}/${collectionId}/${recordId}/${thumbnail}`;
  const width = parseInt(size.split("x")[0], 10) || undefined;
  return withOptimized(raw, width);
}

export function getImageUrl(collectionId: string, recordId: string, filename: string, width?: number): string {
  const raw = `${PHOTO_BASE}/${collectionId}/${recordId}/${filename}`;
  return withOptimized(raw, width);
}
