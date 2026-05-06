import { NextResponse } from "next/server";
import { getNavItems } from "@/lib/navigation";

export async function GET() {
  const items = await getNavItems();
  return NextResponse.json(items);
}
