import { NextResponse } from "next/server";
import { IS_PROD } from "@/config";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("vht_admin_token", "", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
