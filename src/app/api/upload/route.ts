import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { getImageUrl } from "@/lib/media";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL!;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const pb = new PocketBase(PB_URL);

    const cookieStore = await cookies();
    const adminToken = cookieStore.get("vht_admin_token")?.value;
    if (adminToken) pb.authStore.save(adminToken, null);

    const record = await pb.collection("products").create({
      name: "_upload_temp",
      slug: `_upload_${Date.now()}`,
      price: 1,
      is_active: true,
    });

    const fd = new FormData();
    fd.append("images", file);
    const updated = await pb.collection("products").update(record.id, fd);

    const img = (updated as Record<string, unknown>).images as string[];
    const collectionId = (updated as Record<string, unknown>).collectionId as string;
    const url = img?.[0] ? getImageUrl(collectionId, updated.id, img[0]) : "";

    return NextResponse.json({ url });
  } catch (e) {
    console.error("Upload failed:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
