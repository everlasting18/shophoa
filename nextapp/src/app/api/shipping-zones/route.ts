import { NextResponse } from "next/server";
import { getShippingZones } from "@/services/shipping";

export const runtime = "nodejs";

export async function GET() {
  const zones = await getShippingZones();
  return NextResponse.json(zones);
}
