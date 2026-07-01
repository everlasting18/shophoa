/* Đẩy đơn web sang PocketBase của hoa-order (CRM tiệm hoa).
   2 instance PocketBase khác nhau → tạo client riêng trỏ HOA_ORDER_PB_URL.
   Đơn vào ở trạng thái pending (source "web" cần duyệt) — khớp luồng duyệt đơn
   web sẵn có của CRM. Create-rule của orders bên hoa-order để công khai nên
   không cần đăng nhập (xem scripts/setup-web-intake.mjs).

   Best-effort: lỗi ở đây KHÔNG được làm hỏng checkout — caller fire-and-forget. */
import PocketBase from "pocketbase";
import { PHOTO_BASE } from "@/config";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  // Để dựng URL ảnh mẫu (PocketBase của shophoa) — đẩy kèm sang hoa-order.
  thumbnail?: string;
  collectionId?: string;
  product_id?: string;
}

/** URL ảnh mẫu sản phẩm trên PocketBase shophoa (qua proxy R2 PHOTO_BASE). */
function itemImageUrl(it: OrderItem): string | null {
  if (it.thumbnail && it.collectionId && it.product_id) {
    return `${PHOTO_BASE}/${it.collectionId}/${it.product_id}/${it.thumbnail}`;
  }
  return null;
}


export interface HoaOrderPayload {
  orderCode: string;
  qrToken: string;
  customerName: string;
  customerPhone: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress: string;
  deliveryDate: string; // "YYYY-MM-DD" (giờ tường VN)
  deliveryTime: string; // "HH:MM"      (giờ tường VN)
  items: OrderItem[];
  note?: string;
}

// Bảng ký tự mã đơn — khớp genCode() của hoa-order (bỏ O,0,I,1 dễ nhầm).
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Mã đơn kiểu hoa-order: DH + YYMMDD + "-" + 3 ký tự ngẫu nhiên (vd DH260622-7K2).
    Phải khớp pattern field `code` bên hoa-order; mã VHT của shophoa thì không. */
function genHoaCode(d = new Date()): string {
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  let suf = "";
  for (let i = 0; i < 3; i++) suf += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return `DH${yy}${mm}${dd}-${suf}`;
}

/** Giờ tường VN (UTC+7, không DST) -> ISO UTC. Khớp cách hoa-order seed/hiển thị
    (mapOrder dùng new Date().getHours() theo tz trình duyệt VN). */
function deliverAtUTC(dateISO: string, timeHHMM: string): string {
  const [y, mo, d] = dateISO.split("-").map(Number);
  const [hh, mm] = (timeHHMM || "00:00").split(":").map(Number);
  return new Date(Date.UTC(y, (mo || 1) - 1, d || 1, (hh || 0) - 7, mm || 0)).toISOString();
}

/** Tạo đơn tương ứng bên hoa-order. Trả về true nếu đẩy thành công. */
export async function pushToHoaOrder(order: HoaOrderPayload): Promise<boolean> {
  const url = process.env.HOA_ORDER_PB_URL;
  const shop = process.env.HOA_ORDER_SHOP_ID;
  if (!url || !shop) return false; // chưa cấu hình → bỏ qua, không coi là lỗi

  const pb = new PocketBase(url);
  pb.autoCancellation(false);

  // Người nhận là đối tượng giao hàng → map vào customer của CRM.
  const name = order.recipientName?.trim() || order.customerName;
  const phone = order.recipientPhone?.trim() || order.customerPhone;

  // Ảnh mẫu: lưu thẳng URL ảnh từ shophoa vào items[].photo. hoa-order nhận URL
  // http và hiển thị trực tiếp (không coi là tên file PB) — khỏi tải/upload.
  const items = order.items.map((it) => ({
    name: it.name,
    qty: it.quantity,
    price: it.price,
    note: "",
    photo: itemImageUrl(it),
  }));

  const noteLines = [
    `Web #${order.orderCode}`,
    `Người đặt: ${order.customerName} | ${order.customerPhone}`,
  ];
  if (order.note?.trim()) noteLines.push(order.note.trim());

  await pb.collection("orders").create({
    code: genHoaCode(),
    qr_token: order.qrToken,
    customer_name: name,
    phone,
    address: order.recipientAddress || "",
    pickup: false,
    deliver_at: deliverAtUTC(order.deliveryDate, order.deliveryTime),
    source: "web",
    shop,
    status: "received",
    pending: true,
    items,
    ship: 0,
    deposit: 0,
    note: noteLines.join("\n"),
  });

  return true;
}
