import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Skip verification in dev when key not configured
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );
  const data = await res.json() as { success: boolean };

  return NextResponse.json({ success: data.success });
}
