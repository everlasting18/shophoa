const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const OPTIMIZE = process.env.NODE_ENV === "production";

function withOptimized(rawUrl: string, width?: number): string {
  if (!OPTIMIZE) return rawUrl;
  if (width) return `/cdn-cgi/image/format=auto,width=${width}${rawUrl}`;
  return `/cdn-cgi/image/format=auto${rawUrl}`;
}

export function getThumbUrl(collectionId: string, recordId: string, thumbnail: unknown, size = "480x480"): string {
  if (!thumbnail || typeof thumbnail !== "string") return "/images/placeholder-flower.svg";
  const raw = `${PB_URL}/api/files/${collectionId}/${recordId}/${thumbnail}?thumb=${size}`;
  const width = parseInt(size.split("x")[0], 10);
  return withOptimized(raw, width);
}

export function getImageUrl(collectionId: string, recordId: string, filename: string, width?: number): string {
  const raw = `${PB_URL}/api/files/${collectionId}/${recordId}/${filename}`;
  return withOptimized(raw, width);
}
