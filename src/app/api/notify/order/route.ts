import { NextRequest, NextResponse } from "next/server";
import { formatPrice } from "@/lib/utils";

const ZALO_API = "https://openapi.zalo.me/v3.0/oa/message/cs";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface NotifyPayload {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  recipientAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  items: OrderItem[];
  total: number;
  note?: string;
}

function buildMessage(order: NotifyPayload): string {
  const itemLines = order.items
    .map((i) => `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`)
    .join("\n");

  return [
    `🌸 ĐƠN HÀNG MỚI #${order.orderCode}`,
    `👤 ${order.customerName} | ${order.customerPhone}`,
    `📍 ${order.recipientAddress}`,
    `📅 ${order.deliveryDate} | ${order.deliveryTime}`,
    "",
    itemLines,
    "",
    `💰 Tổng: ${formatPrice(order.total)}`,
    order.note ? `📝 ${order.note}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export async function POST(req: NextRequest) {
  const accessToken = process.env.ZALO_OA_ACCESS_TOKEN;
  const adminUserId = process.env.ZALO_ADMIN_USER_ID;

  const order: NotifyPayload = await req.json();

  if (!accessToken || !adminUserId) {
    if (process.env.NODE_ENV === "development") {
      console.log("\n[Zalo notify - DEV MODE]\n" + buildMessage(order) + "\n");
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json({ error: "Zalo not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(ZALO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: accessToken,
      },
      body: JSON.stringify({
        recipient: { user_id: adminUserId },
        message: { text: buildMessage(order) },
      }),
    });

    const json = await res.json() as { error: number; message?: string };
    if (json.error !== 0) {
      console.error("Zalo notify error:", json);
      return NextResponse.json({ error: json.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Zalo notify failed:", e);
    return NextResponse.json({ error: "Failed to reach Zalo API" }, { status: 502 });
  }
}
