import { NextRequest, NextResponse } from "next/server";
import { notifyError } from "@/lib/notify-error";

export async function POST(req: NextRequest) {
  const { title, detail } = await req.json() as { title: string; detail: string };
  await notifyError(title, detail);
  return NextResponse.json({ ok: true });
}
