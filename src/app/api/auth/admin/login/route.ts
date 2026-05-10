import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { PB_URL, IS_PROD } from "@/config";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  try {
    const pb = new PocketBase(PB_URL);
    const authData = await pb.admins.authWithPassword(email, password);

    const response = NextResponse.json({
      token: authData.token,
      adminEmail: email,
    });

    response.cookies.set("vht_admin_token", authData.token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Email hoặc mật khẩu không đúng." },
      { status: 401 }
    );
  }
}
