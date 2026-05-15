import { PHOTO_BASE } from "./config";

export function getThumbUrl(collectionId: string, recordId: string, thumbnail: unknown): string {
  if (!thumbnail || typeof thumbnail !== "string") return "";
  return `${PHOTO_BASE}/${collectionId}/${recordId}/${thumbnail}`;
}

export function getImageUrl(collectionId: string, recordId: string, filename: string): string {
  return `${PHOTO_BASE}/${collectionId}/${recordId}/${filename}`;
}
