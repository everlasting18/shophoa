"use client";

interface CompressOptions {
  /** Cạnh dài tối đa (px). Mặc định 1280. */
  maxWidthOrHeight?: number;
  /** Chất lượng encode 0–1. Mặc định 0.72. */
  quality?: number;
  /** MIME đích. Mặc định image/webp. */
  mimeType?: string;
}

/**
 * Nén ảnh ở client trước khi upload (canvas, không cần thư viện ngoài).
 * - Resize về cạnh dài tối đa, encode WebP, tự xử lý EXIF orientation qua createImageBitmap.
 * - Bỏ qua GIF/SVG/non-image. Nếu nén ra to hơn hoặc lỗi → trả về file gốc.
 *
 * Tương đương `admin/src/lib/image.ts` nhưng không dùng `browser-image-compression`
 * (nextapp không có dependency đó).
 */
export async function compressImage(
  file: File,
  { maxWidthOrHeight = 1280, quality = 0.72, mimeType = "image/webp" }: CompressOptions = {}
): Promise<File> {
  if (
    typeof document === "undefined" ||
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    const scale = Math.min(1, maxWidthOrHeight / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mimeType, quality)
    );
    if (!blob || blob.size >= file.size) return file;

    const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
    const name = file.name.replace(/\.[^.]+$/, "") + ext;
    return new File([blob], name, { type: blob.type, lastModified: Date.now() });
  } catch (err) {
    console.error("compressImage failed, dùng ảnh gốc:", err);
    return file;
  } finally {
    bitmap?.close?.();
  }
}
