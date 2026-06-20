import pb from "@/services/pocketbase";
import type { Product, Category } from "@/schema";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SOCIAL, SERVICE_DISTRICTS } from "@/config";
import { GRABMART_URL } from "@/config/third-party";
import { getSiteSettings } from "@/services/settings";
import postsManifest from "@/content/posts-manifest.json";

// Regenerate at most once per hour (same cadence as sitemap)
export const revalidate = 3600;

const BASE = SITE_URL;

function fmtPrice(p: number): string {
  return new Intl.NumberFormat("vi-VN").format(p) + "đ";
}

// sale_price = 0 nghĩa là "không giảm giá" → dùng giá gốc.
function effectivePrice(p: Product): number {
  return p.sale_price && p.sale_price > 0 ? p.sale_price : p.price;
}

export async function GET() {
  const contact = await getSiteSettings();

  let categories: Category[] = [];
  let products: Product[] = [];

  try {
    categories = await pb.collection("categories").getFullList<Category>({
      filter: "is_active=true",
      fields: "id,name,slug,description,parent,sort_order",
      sort: "sort_order",
    });
  } catch {
    // PocketBase unreachable at build time — skip
  }

  try {
    products = await pb.collection("products").getFullList<Product>({
      filter: "is_active=true",
      fields: "name,slug,price,sale_price,short_description,is_best_seller",
      sort: "-is_best_seller,-updated",
    });
  } catch {
    // PocketBase unreachable at build time — skip
  }

  const effectivePrices = products
    .map(effectivePrice)
    .filter((n) => n > 0);
  const minPrice = effectivePrices.length ? Math.min(...effectivePrices) : 0;

  const out: string[] = [];
  const push = (s = "") => out.push(s);

  // ── Header ─────────────────────────────────────────────────────────
  push(`# ${SITE_NAME}`);
  push();
  push(`> ${SITE_DESCRIPTION}`);
  push();
  push(
    `${SITE_NAME} là shop hoa tươi tại Thành phố Hồ Chí Minh, chuyên thiết kế và ` +
      `giao hoa cho các dịp: sinh nhật, khai trương, tốt nghiệp, tình yêu, lễ Tết và ` +
      `chúc mừng. Sản phẩm gồm bó hoa, lẵng hoa, giỏ hoa và kệ hoa. ` +
      `Giao hỏa tốc trong vòng 60 phút khu vực nội thành, cam kết hoa tươi giống mẫu 100%.`,
  );
  push();

  // ── Business facts (mirror of schema.org LocalBusiness/FloristShop) ──
  push("## Thông tin doanh nghiệp");
  push();
  push(`- Loại hình: Shop hoa tươi (Florist) tại Thành phố Hồ Chí Minh`);
  push(`- Khu vực phục vụ: Toàn TP.HCM — giao hỏa tốc 60 phút nội thành`);
  push(`- Quận giao nhanh: ${SERVICE_DISTRICTS.join(", ")}`);
  push(`- Giờ mở cửa: ${contact.openingHours}`);
  const phones = [contact.phoneDisplay, contact.phone2Display].filter(Boolean);
  push(`- Hotline & Zalo: ${phones.join(" – ")}`);
  push(`- Email: ${contact.email}`);
  contact.addresses.forEach((addr) => push(`- Địa chỉ: ${addr}`));
  if (minPrice > 0) push(`- Mức giá: từ ${fmtPrice(minPrice)}`);
  push(`- Thanh toán: Tiền mặt, Chuyển khoản ngân hàng`);
  push(`- Cam kết: Hoa tươi giống mẫu 100%, đổi mới nếu không đạt`);
  if (contact.freeShippingNote) push(`- Giao hàng: ${contact.freeShippingNote}`);
  push();

  // ── Categories (parent → children tree) ─────────────────────────────
  if (categories.length) {
    const parents = categories.filter((c) => !c.parent);
    const childrenOf = (parentId: string) =>
      categories.filter((c) => c.parent === parentId);

    const catLine = (cat: Category, indent = "") => {
      const desc = cat.description ? `: ${cat.description}` : "";
      return `${indent}- [${cat.name}](${BASE}/${cat.slug})${desc}`;
    };

    push("## Danh mục sản phẩm");
    push();
    parents.forEach((parent) => {
      push(catLine(parent));
      childrenOf(parent.id).forEach((child) => push(catLine(child, "  ")));
    });
    push();
  }

  // ── Products (best-sellers first) ───────────────────────────────────
  if (products.length) {
    push("## Sản phẩm");
    push();
    products.forEach((p) => {
      const price = effectivePrice(p);
      const star = p.is_best_seller ? "⭐ " : "";
      const priceTag = price > 0 ? fmtPrice(price) : "Giá liên hệ";
      const desc = p.short_description ? ` — ${p.short_description}` : "";
      push(
        `- ${star}[${p.name.trim()}](${BASE}/san-pham/${p.slug}) (${priceTag})${desc}`,
      );
    });
    push();
  }

  // ── Blog ────────────────────────────────────────────────────────────
  if (postsManifest.length) {
    push("## Cẩm nang & Blog về hoa");
    push();
    postsManifest.forEach((post) => {
      const desc = post.description ? `: ${post.description}` : "";
      push(`- [${post.title}](${BASE}/blog/${post.slug})${desc}`);
    });
    push();
  }

  // ── Info pages ──────────────────────────────────────────────────────
  push("## Trang thông tin");
  push();
  push(`- [Tất cả sản phẩm](${BASE}/san-pham): Toàn bộ danh mục hoa của shop`);
  push(`- [Giới thiệu](${BASE}/gioi-thieu): Về Tiệm Hoa Nhà Tình`);
  push(`- [Liên hệ](${BASE}/lien-he): Thông tin liên hệ và bản đồ cửa hàng`);
  push(`- [Chính sách bảo mật](${BASE}/chinh-sach-bao-mat): Bảo mật thông tin khách hàng`);
  push();

  // ── Ordering channels & social ──────────────────────────────────────
  push("## Kênh đặt hàng & mạng xã hội");
  push();
  push(`- [Đặt hàng tại website](${BASE}/san-pham): Đặt online, giao tận nơi TP.HCM`);
  if (contact.zalo) push(`- [Zalo](${contact.zalo}): Tư vấn và đặt hoa nhanh qua Zalo`);
  if (contact.whatsapp) push(`- [WhatsApp](${contact.whatsapp}): Liên hệ qua WhatsApp`);
  if (GRABMART_URL) push(`- [GrabMart](${GRABMART_URL}): Đặt hoa qua ứng dụng Grab`);
  push(`- [Facebook](${SOCIAL.facebook})`);
  push(`- [Instagram](${SOCIAL.instagram})`);
  push();

  return new Response(out.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
