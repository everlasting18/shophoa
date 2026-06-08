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

const MOCK_FLOWERS = [
  "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1606041011872-596597976b25?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
];

export function getThumbUrl(collectionId: string, recordId: string, thumbnail: unknown, size = "480x480"): string {
  if (!thumbnail || typeof thumbnail !== "string") {
    let sum = 0;
    if (recordId) {
      for (let i = 0; i < recordId.length; i++) {
        sum += recordId.charCodeAt(i);
      }
    }
    const idx = sum % MOCK_FLOWERS.length;
    return MOCK_FLOWERS[idx];
  }
  const raw = `${PHOTO_BASE}/${collectionId}/${recordId}/${thumbnail}`;
  const width = parseInt(size.split("x")[0], 10) || undefined;
  return withOptimized(raw, width);
}

export function getImageUrl(collectionId: string, recordId: string, filename: string, width?: number): string {
  const raw = `${PHOTO_BASE}/${collectionId}/${recordId}/${filename}`;
  return withOptimized(raw, width);
}

/**
 * URL ảnh Open Graph chuẩn 1200×630 (tỉ lệ 1.91:1), crop `fit=cover` qua Cloudflare.
 * Ảnh sản phẩm thường vuông/dọc → ép về khung ngang để Facebook/Zalo không tự crop lệch.
 * Dev (OPTIMIZE=false) trả URL gốc — OG chỉ thực sự cần ở production.
 */
export function getOgImageUrl(collectionId: string, recordId: string, filename: string): string {
  const raw = `${PHOTO_BASE}/${collectionId}/${recordId}/${filename}`;
  return cfImage(raw, { width: 1200, height: 630, fit: "cover", format: "auto" });
}
