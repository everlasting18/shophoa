import { NextRequest, NextResponse } from "next/server";
import { formatPrice } from "@/lib/utils";
import { shortDateISO } from "@/lib/date-utils";
import { PHOTO_BASE } from "@/config";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  thumbnail?: string;
  collectionId?: string;
  product_id?: string;
}

interface NotifyPayload {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  items: OrderItem[];
  total: number;
  note?: string;
}

function itemImageUrl(item: OrderItem): string | null {
  if (item.thumbnail && item.collectionId && item.product_id) {
    return `${PHOTO_BASE}/${item.collectionId}/${item.product_id}/${item.thumbnail}`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const order: NotifyPayload = await req.json();

  if (!webhookUrl) {
    if (process.env.NODE_ENV === "development") {
      console.log("\n[Discord notify - DEV]\n", order, "\n");
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json({ error: "Discord not configured" }, { status: 503 });
  }

  const recipient =
    order.recipientName && order.recipientName !== order.customerName
      ? order.recipientName
      : order.customerName;

  // Main order embed
  const mainEmbed = {
    title: `🌸 ĐƠN HÀNG MỚI #${order.orderCode}`,
    color: 0xe11d48,
    fields: [
      {
        name: "👤 Người đặt",
        value: `${order.customerName} | ${order.customerPhone}`,
        inline: true,
      },
      {
        name: "🎁 Người nhận",
        value: `${recipient}${order.recipientPhone ? ` | ${order.recipientPhone}` : ""}`,
        inline: true,
      },
      {
        name: "📍 Địa chỉ",
        value: order.recipientAddress || "—",
        inline: false,
      },
      {
        name: "📅 Ngày giao",
        value: shortDateISO(order.deliveryDate),
        inline: true,
      },
      {
        name: "⏰ Giờ giao",
        value: order.deliveryTime,
        inline: true,
      },
      {
        name: "💰 Tổng cộng",
        value: formatPrice(order.total),
        inline: true,
      },
      ...(order.note
        ? [{ name: "📝 Ghi chú", value: order.note, inline: false }]
        : []),
    ],
    footer: { text: "Tiệm hoa nhà tình" },
    timestamp: new Date().toISOString(),
  };

  // One embed per product (with image if available)
  const productEmbeds = order.items.map((item) => {
    const imgUrl = itemImageUrl(item);
    return {
      color: 0xfda4af,
      fields: [
        {
          name: item.name,
          value: `x${item.quantity} — ${formatPrice(item.price * item.quantity)}`,
          inline: false,
        },
      ],
      ...(imgUrl ? { thumbnail: { url: imgUrl } } : {}),
    };
  });

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [mainEmbed, ...productEmbeds] }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Discord notify error:", res.status, text);
      return NextResponse.json({ error: "Discord API error" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Discord notify failed:", e);
    return NextResponse.json({ error: "Failed to reach Discord" }, { status: 502 });
  }
}
