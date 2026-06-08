import { NextRequest, NextResponse } from "next/server";
import { PB_URL } from "@/config";

// ── Server-side PocketBase admin token (module-level cache) ─────────────────

let _adminToken: string | null = null;
let _tokenExpiry = 0;

async function getAdminToken(): Promise<string> {
  if (_adminToken && Date.now() < _tokenExpiry) return _adminToken;

  const res = await fetch(
    `${PB_URL}/api/collections/_superusers/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: process.env.PB_ADMIN_EMAIL,
        password: process.env.PB_ADMIN_PASSWORD,
      }),
    }
  );

  if (!res.ok) throw new Error("PB admin auth failed");
  const data = await res.json() as { token: string };
  _adminToken = data.token;
  _tokenExpiry = Date.now() + 55 * 60 * 1000; // cache 55 phút
  return _adminToken;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function pbCount(filter: string): Promise<number> {
  const token = await getAdminToken();
  const url = `${PB_URL}/api/collections/checkin_vouchers/records?perPage=1&skipTotal=0&filter=${encodeURIComponent(filter)}`;
  const res = await fetch(url, { headers: { Authorization: token } });
  if (!res.ok) return 0;
  const data = await res.json() as { totalItems?: number };
  return data.totalItems ?? 0;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const userName = formData.get("user_name") as string | null;
    const userPhone = ((formData.get("user_phone") as string | null) ?? "").trim();
    const screenshot = formData.get("screenshot") as File | null;

    if (!userName?.trim()) {
      return NextResponse.json({ error: "user_name required" }, { status: 400 });
    }
    if (!userPhone) {
      return NextResponse.json({ error: "user_phone required" }, { status: 400 });
    }

    // ── Validate ảnh (không tin client) ────────────────────────────────────
    const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5MB (client đã nén ~<1MB)
    if (!screenshot) {
      return NextResponse.json({ error: "screenshot required" }, { status: 400 });
    }
    if (!screenshot.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "invalid_type", message: "File tải lên phải là ảnh." },
        { status: 400 }
      );
    }
    if (screenshot.size > MAX_SCREENSHOT_BYTES) {
      return NextResponse.json(
        { error: "too_large", message: "Ảnh quá lớn, vui lòng thử lại." },
        { status: 413 }
      );
    }

    // ── Chống gian lận ─────────────────────────────────────────────────────

    // 1. Trùng SĐT
    const phoneCount = await pbCount(`user_phone='${userPhone}'`);
    if (phoneCount > 0) {
      return NextResponse.json(
        { error: "duplicate_phone", message: "Số điện thoại này đã nhận voucher rồi." },
        { status: 409 }
      );
    }

    // 2. Trùng ảnh (hash SHA-256)
    const hash = await fileHash(screenshot);
    const hashCount = await pbCount(`screenshot_hash='${hash}'`);
    if (hashCount > 0) {
      return NextResponse.json(
        { error: "duplicate_image", message: "Ảnh check-in này đã được sử dụng rồi." },
        { status: 409 }
      );
    }

    // ── Lưu vào PocketBase ─────────────────────────────────────────────────

    const qrToken = crypto.randomUUID();
    const token = await getAdminToken();

    const pbForm = new FormData();
    pbForm.append("user_name", userName.trim());
    pbForm.append("user_phone", userPhone);
    pbForm.append("qr_token", qrToken);
    pbForm.append("status", "pending");
    pbForm.append("screenshot_hash", hash);
    if (screenshot) pbForm.append("screenshot", screenshot);

    const res = await fetch(`${PB_URL}/api/collections/checkin_vouchers/records`, {
      method: "POST",
      headers: { Authorization: token },
      body: pbForm,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[checkin] PocketBase save error:", err);
      return NextResponse.json({ error: "Failed to save" }, { status: 502 });
    }

    const record = await res.json() as { id: string };
    return NextResponse.json({ qr_token: qrToken, record_id: record.id });
  } catch (e) {
    console.error("[checkin] Unhandled error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
