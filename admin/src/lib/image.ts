import imageCompression from "browser-image-compression";

interface CompressOptions {
  /** Cạnh dài tối đa (px). Mặc định 1600. */
  maxWidthOrHeight?: number;
  /** Dung lượng đích (MB). Mặc định 0.6. */
  maxSizeMB?: number;
}

/**
 * Nén ảnh ở client trước khi upload lên PocketBase.
 * - Resize về cạnh dài tối đa, ép về ~maxSizeMB, encode WebP, tự xử lý EXIF orientation, chạy trong Web Worker.
 * - Bỏ qua GIF/SVG/non-image. Nếu nén ra to hơn hoặc lỗi → trả về file gốc.
 */
export async function compressImage(
  file: File,
  { maxWidthOrHeight = 1600, maxSizeMB = 0.6 }: CompressOptions = {}
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight,
      maxSizeMB,
      useWebWorker: true,
      fileType: "image/webp",
    });

    if (compressed.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([compressed], name, { type: "image/webp", lastModified: Date.now() });
  } catch (err) {
    console.error("compressImage failed, dùng ảnh gốc:", err);
    return file;
  }
}

/** Nén nhiều ảnh song song (cho gallery). */
export function compressImages(files: File[], opts?: CompressOptions): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, opts)));
}
