import { NextResponse } from "next/server";
import { getSiteSettings } from "@/services/settings";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}
