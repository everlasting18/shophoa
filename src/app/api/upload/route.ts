import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { getImageUrl } from "@/lib/media";
import { PB_URL } from "@/config";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const pb = new PocketBase(PB_URL);

    const cookieStore = await cookies();
    const adminToken = cookieStore.get("vht_admin_token")?.value;
    if (adminToken) pb.authStore.save(adminToken, null);

    let recordId: string | null = null;
    const tempSlug = `_upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    try {
      const record = await pb.collection("products").create({
        name: "_upload_temp",
        slug: tempSlug,
        price: 1,
        is_active: false,
      });
      recordId = record.id;

      const fd = new FormData();
      fd.append("images", file);
      const updated = await pb.collection("products").update(record.id, fd);

      const img = (updated as Record<string, unknown>).images as string[];
      const collectionId = (updated as Record<string, unknown>).collectionId as string;
      const imageFilename = img?.[0] ?? "";
      const url = imageFilename ? getImageUrl(collectionId, updated.id, imageFilename) : "";

      return NextResponse.json({ url, filename: imageFilename });
    } finally {
      if (recordId) {
        try { await pb.collection("products").delete(recordId); } catch { /* temp record may already be gone */ }
      }
    }
  } catch (e) {
    console.error("Upload failed:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
