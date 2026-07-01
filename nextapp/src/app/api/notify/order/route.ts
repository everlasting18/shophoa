import { NextRequest, NextResponse } from "next/server";
import { formatPrice } from "@/lib/utils";
import { shortDateISO } from "@/lib/date-utils";
import { PHOTO_BASE } from "@/config";
import { notifyError } from "@/lib/notify-error";
import { pushToHoaOrder } from "@/lib/hoa-order";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  thumbnail?: string;
  collectionId?: string;
  product_id?: string;
  slug?: string;
}

interface NotifyPayload {
  orderCode: string;
  qrToken: string;
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

// ── Discord ──────────────────────────────────────────────────────────────────

async function notifyDiscord(webhookUrl: string, order: NotifyPayload): Promise<void> {
  const recipient =
    order.recipientName && order.recipientName !== order.customerName
      ? order.recipientName
      : order.customerName;

  const mainEmbed = {
    title: `🌸 ĐƠN HÀNG MỚI #${order.orderCode}`,
    color: 0xe11d48,
    fields: [
      { name: "👤 Người đặt", value: `${order.customerName} | ${order.customerPhone}`, inline: true },
      { name: "🎁 Người nhận", value: `${recipient}${order.recipientPhone ? ` | ${order.recipientPhone}` : ""}`, inline: true },
      { name: "📍 Địa chỉ", value: order.recipientAddress || "—", inline: false },
      { name: "📅 Ngày giao", value: shortDateISO(order.deliveryDate), inline: true },
      { name: "⏰ Giờ giao", value: order.deliveryTime, inline: true },
      { name: "💰 Tổng cộng", value: formatPrice(order.total), inline: true },
      ...(order.note ? [{ name: "📝 Ghi chú", value: order.note, inline: false }] : []),
    ],
    footer: { text: "Tiệm hoa nhà tình" },
    timestamp: new Date().toISOString(),
  };

  const productEmbeds = order.items.map((item) => {
    const imgUrl = itemImageUrl(item);
    return {
      color: 0xfda4af,
      fields: [{ name: item.name, value: `x${item.quantity} — ${formatPrice(item.price * item.quantity)}`, inline: false }],
      ...(imgUrl ? { thumbnail: { url: imgUrl } } : {}),
    };
  });

  const payload = JSON.stringify({ embeds: [mainEmbed, ...productEmbeds] });
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    if (res.ok) return;

    if (res.status === 429 && attempt < maxAttempts) {
      const retryAfter = parseInt(res.headers.get("retry-after") ?? "1", 10);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    const text = await res.text();
    if (attempt === maxAttempts) throw new Error(`Discord ${res.status}: ${text}`);
    await new Promise((r) => setTimeout(r, attempt * 1000));
  }
}

// ── Lark ─────────────────────────────────────────────────────────────────────

async function getLarkToken(): Promise<string> {
  const res = await fetch("https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: process.env.LARK_APP_ID,
      app_secret: process.env.LARK_APP_SECRET,
    }),
  });
  const data = await res.json() as { code: number; msg: string; tenant_access_token: string };
  if (data.code !== 0) throw new Error(`Lark auth: ${data.msg}`);
  return data.tenant_access_token;
}

async function uploadImageToLark(token: string, imageUrl: string): Promise<string | null> {
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const buffer = await imgRes.arrayBuffer();
    const form = new FormData();
    form.append("image_type", "message");
    form.append("image", new Blob([buffer]), "photo.jpg");
    const res = await fetch("https://open.larksuite.com/open-apis/im/v1/images", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json() as { code: number; msg?: string; data?: { image_key: string } };
    if (data.code !== 0) console.error("Lark image upload failed:", data.code, data.msg);
    return data.code === 0 && data.data ? data.data.image_key : null;
  } catch (e) {
    console.error("Lark image upload error:", e);
    return null;
  }
}

async function notifyLark(webhookUrl: string, order: NotifyPayload): Promise<void> {
  const recipient =
    order.recipientName && order.recipientName !== order.customerName
      ? order.recipientName
      : order.customerName;

  let token: string | null = null;
  if (process.env.LARK_APP_ID && process.env.LARK_APP_SECRET) {
    try { token = await getLarkToken(); } catch (e) { console.error("Lark token failed:", e); }
  }

  const infoLines = [
    `👤 **Người đặt:** ${order.customerName} | ${order.customerPhone}`,
    `🎁 **Người nhận:** ${recipient}${order.recipientPhone ? ` | ${order.recipientPhone}` : ""}`,
    `📍 **Địa chỉ:** ${order.recipientAddress || "—"}`,
    `📅 **Ngày giao:** ${shortDateISO(order.deliveryDate)}  ⏰ **Giờ:** ${order.deliveryTime}`,
    `💰 **Tổng cộng:** ${formatPrice(order.total)}`,
  ];
  if (order.note) infoLines.push(`📝 **Ghi chú:** ${order.note}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productElements: any[] = [];
  for (const item of order.items) {
    const url = itemImageUrl(item);
    const imgKey = token && url ? await uploadImageToLark(token, url) : null;

    const productUrl = item.slug ? `https://tiemhoanhatinh.com/san-pham/${item.slug}` : null;
    const nameText = productUrl ? `**[${item.name}](${productUrl})**` : `**${item.name}**`;

    if (imgKey) {
      productElements.push({
        tag: "column_set",
        flex_mode: "none",
        background_style: "default",
        columns: [
          {
            tag: "column",
            width: "auto",
            elements: [{ tag: "img", img_key: imgKey, alt: { tag: "plain_text", content: item.name }, preview: true }],
          },
          {
            tag: "column",
            width: "weighted",
            weight: 1,
            vertical_align: "center",
            elements: [{ tag: "markdown", content: `${nameText}\nx${item.quantity} — ${formatPrice(item.price * item.quantity)}` }],
          },
        ],
      });
    } else {
      productElements.push({
        tag: "markdown",
        content: `• ${nameText}  x${item.quantity}  ${formatPrice(item.price * item.quantity)}`,
      });
    }
  }

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: "plain_text", content: `🌸 ĐƠN HÀNG MỚI #${order.orderCode}` },
      template: "red",
    },
    elements: [
      { tag: "markdown", content: infoLines.join("\n") },
      { tag: "hr" },
      ...productElements,
    ],
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msg_type: "interactive", card }),
  });
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  const larkUrl = process.env.LARK_WEBHOOK_URL;
  const order: NotifyPayload = await req.json();

  // 3 đích chạy song song, độc lập: Discord, Lark, và đẩy đơn sang hoa-order (CRM).
  // Mỗi cái lỗi không kéo cái khác — checkout đã fire-and-forget nên không chặn khách.
  const [discordResult, larkResult, hoaResult] = await Promise.allSettled([
    discordUrl ? notifyDiscord(discordUrl, order) : Promise.resolve(),
    larkUrl    ? notifyLark(larkUrl, order)        : Promise.resolve(),
    pushToHoaOrder(order),
  ]);

  if (hoaResult.status === "rejected") {
    const err = hoaResult.reason;
    console.error("hoa-order push failed:", err);
    await notifyError(
      "Đẩy đơn sang hoa-order thất bại",
      `Đơn **${order.orderCode}** không vào được CRM.\n\`${String(err)}\``
    );
  }

  if (!discordUrl && !larkUrl) {
    if (process.env.NODE_ENV === "development") {
      console.log("\n[notify - DEV]\n", order, "\n");
    }
    // Không có webhook chat, nhưng vẫn coi là OK nếu đẩy hoa-order không lỗi.
    return NextResponse.json({ ok: hoaResult.status !== "rejected", dev: process.env.NODE_ENV === "development" });
  }

  const discordFailed = discordUrl && discordResult.status === "rejected";
  const larkFailed    = larkUrl    && larkResult.status    === "rejected";

  if (discordFailed) {
    const err = (discordResult as PromiseRejectedResult).reason;
    console.error("Discord notify failed:", err);
    await notifyError(
      "Discord webhook thất bại",
      `Đơn hàng **${order.orderCode}** không gửi được.\n\`${String(err)}\``
    );
  }

  if (larkFailed) {
    console.error("Lark notify failed:", (larkResult as PromiseRejectedResult).reason);
  }

  if (!discordFailed || !larkFailed) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "All webhooks failed" }, { status: 502 });
}
