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
    if (!adminToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    pb.authStore.save(adminToken, null);

    const fd = new FormData();
    fd.append("file", file);
    const record = await pb.collection("media").create(fd);

    const filename = (record as Record<string, unknown>).file as string;
    const url = getImageUrl(record.collectionId, record.id, filename);

    return NextResponse.json({ url });
  } catch (e: unknown) {
    const pbErr = e as { status?: number; data?: { message?: string } };
    const msg = pbErr?.data?.message || (e instanceof Error ? e.message : "Upload failed");
    console.error("Upload error:", pbErr?.status, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
