"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Info } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/components/product/price-display";
import pb from "@/lib/pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;

const TIME_GROUPS = [
  { period: "Sáng", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"] },
  { period: "Chiều", slots: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"] },
  { period: "Tối", slots: ["18:00", "18:30", "19:00", "19:30", "20:00"] },
];

const SHIPPING_ZONES = [
  { label: "Quận 1, Quận 3, Quận 5, Quận 10", fee: 20000 },
  { label: "Quận 4, Phú Nhuận", fee: 30000 },
  { label: "Quận 6, Quận 7, Quận 8, Quận 11", fee: 40000 },
  { label: "Bình Thạnh", fee: 40000 },
  { label: "Tân Bình | Bình Tân | Tân Phú | Gò Vấp", fee: 60000 },
  { label: "Quận 2", fee: 50000 },
  { label: "Quận 9 – Quận 12 – Nhà Bè – Bình Chánh – Hóc Môn – Thủ Đức (Theo Phí Grab)", fee: 80000 },
  { label: "Lấy tại cửa hàng", fee: 0 },
];

const DAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function isoToDisplay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAY_NAMES[dt.getDay()]}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function addDaysToISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, totalPrice, clearCart } = useCartStore();

  const [todayISO] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [dateMode, setDateMode] = useState<"today" | "tomorrow" | "custom">("today");
  const [customDate, setCustomDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [sameAsBuyer, setSameAsBuyer] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [note, setNote] = useState("");
  const [shippingIdx, setShippingIdx] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedDateISO =
    dateMode === "today" ? todayISO :
    dateMode === "tomorrow" ? (todayISO ? addDaysToISO(todayISO, 1) : "") :
    customDate;

  const shippingFee = SHIPPING_ZONES[shippingIdx].fee;
  const subtotal = totalPrice();
  const total = subtotal + shippingFee;
  const isPickup = SHIPPING_ZONES[shippingIdx].fee === 0 && SHIPPING_ZONES[shippingIdx].label.includes("cửa hàng");

  function validate() {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = "Vui lòng nhập họ tên";
    if (!/^0[0-9]{9}$/.test(customerPhone)) e.customerPhone = "SĐT không hợp lệ";
    if (!sameAsBuyer) {
      if (!recipientName.trim()) e.recipientName = "Vui lòng nhập tên người nhận";
      if (!/^0[0-9]{9}$/.test(recipientPhone)) e.recipientPhone = "SĐT không hợp lệ";
    }
    if (!isPickup && !recipientAddress.trim()) e.recipientAddress = "Vui lòng nhập địa chỉ";
    if (!selectedDateISO) e.date = "Vui lòng chọn ngày giao";
    if (!selectedTime) e.time = "Vui lòng chọn giờ giao";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError("");
    try {
      const finalName = sameAsBuyer ? customerName : recipientName;
      const finalPhone = sameAsBuyer ? customerPhone : recipientPhone;
      const finalAddress = isPickup ? "Lấy tại cửa hàng" : recipientAddress;

      const orderItems = items.map(({ product, quantity }) => ({
        product_id: product.id,
        name: product.name,
        price: product.sale_price ?? product.price,
        quantity,
      }));

      const record = await pb.collection("orders").create({
        customer_name: customerName,
        customer_phone: customerPhone,
        recipient_name: finalName,
        recipient_phone: finalPhone,
        recipient_address: finalAddress,
        delivery_date: selectedDateISO,
        delivery_time: selectedTime,
        items: orderItems,
        subtotal,
        total,
        note: `[Ship: ${SHIPPING_ZONES[shippingIdx].label}] ${note}`.trim(),
        status: "pending",
        payment_method: "bank_transfer",
      });
      await pb.collection("orders").update(record.id, {
        order_code: `VHT${record.id.slice(-6).toUpperCase()}`,
      });

      clearCart();
      router.push(`/dat-hoa/cam-on?id=${record.id}`);
    } catch {
      setSubmitError("Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ Zalo.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Giỏ hàng trống</p>
        <Link href="/" className="text-primary hover:underline">← Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3]">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Link href="/gio-hang" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Giỏ hàng
        </Link>

        {/* Info banner */}
        <div className="flex gap-3 bg-[#e8f0e9] border border-[#c5dbc7] rounded-xl p-4 mb-5 text-sm text-[#3a5c42]">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Vườn Hoa Tươi giao hoa tận nơi tại TP. Hồ Chí Minh.</p>
            <p className="opacity-80 mt-0.5">Sau khi thanh toán thành công hãy nhắn đơn bạn đến Zalo để chúng mình check đơn nhanh nhất cho bạn nhé!</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
            {/* ── LEFT ── */}
            <div className="space-y-4">
              {/* Delivery time */}
              <Card title="Thời gian giao hoa">
                <div className="mb-5">
                  <p className="text-sm font-medium mb-2">Chọn ngày giao <span className="text-destructive">*</span></p>
                  <div className="flex gap-2">
                    {(["today", "tomorrow", "custom"] as const).map((mode) => (
                      <button key={mode} type="button" onClick={() => setDateMode(mode)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${dateMode === mode ? "bg-primary text-white border-primary" : "bg-white border-border hover:border-primary/40"}`}>
                        {mode === "today" ? "Hôm nay" : mode === "tomorrow" ? "Ngày mai" : "Khác"}
                      </button>
                    ))}
                  </div>
                  {dateMode === "custom" ? (
                    <input type="date" value={customDate} min={todayISO}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className={`${iCls} mt-3`} />
                  ) : (
                    selectedDateISO && (
                      <p className="text-sm text-primary font-medium mt-2 flex items-center gap-1.5">
                        📅 {isoToDisplay(selectedDateISO)}
                      </p>
                    )
                  )}
                  {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
                </div>

                <p className="text-sm font-medium mb-2">Chọn giờ giao <span className="text-destructive">*</span></p>
                <div className="space-y-3">
                  {TIME_GROUPS.map(({ period, slots }) => (
                    <div key={period}>
                      <p className="text-xs font-semibold text-primary mb-2">{period}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button key={slot} type="button" onClick={() => setSelectedTime(slot)}
                            className={`py-2 text-sm font-medium rounded-lg border transition-colors ${selectedTime === slot ? "bg-primary text-white border-primary" : "bg-white border-border hover:border-primary/40"}`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.time && <p className="text-xs text-destructive mt-2">{errors.time}</p>}
              </Card>

              {/* Buyer */}
              <Card title="Người đặt">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tên người đặt *" className={iCls} />
                    {errors.customerName && <Err msg={errors.customerName} />}
                  </div>
                  <div>
                    <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Số điện thoại *" className={iCls} />
                    {errors.customerPhone && <Err msg={errors.customerPhone} />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">Tiệm sẽ gửi hình ảnh thành phẩm trước khi giao.</p>
              </Card>

              {/* Recipient */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-base">Người nhận</h3>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="checkbox" checked={sameAsBuyer} onChange={(e) => setSameAsBuyer(e.target.checked)} className="rounded" />
                    <span className="text-muted-foreground">Là người đặt (tuỳ chọn)</span>
                  </label>
                </div>
                <div className="space-y-3">
                  {!sameAsBuyer && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="Tên người nhận *" className={iCls} />
                        {errors.recipientName && <Err msg={errors.recipientName} />}
                      </div>
                      <div>
                        <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="Số điện thoại người nhận *" className={iCls} />
                        {errors.recipientPhone && <Err msg={errors.recipientPhone} />}
                      </div>
                    </div>
                  )}
                  {!isPickup && (
                    <div>
                      <input value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Địa chỉ giao hàng: số nhà, đường, phường, quận *" className={iCls} />
                      {errors.recipientAddress && <Err msg={errors.recipientAddress} />}
                    </div>
                  )}
                </div>
              </Card>

              {/* Note */}
              <Card title="Nội Dung Thiệp/Decal (Nếu Có) (tuỳ chọn)">
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
                  placeholder="Thời gian nhận Hoa - Nội dung Thiệp Hoặc Decal."
                  className={`${iCls} resize-none`} />
              </Card>
            </div>

            {/* ── RIGHT ── */}
            <div className="space-y-4">
              {/* Products */}
              <Card title="Sản Phẩm">
                <div className="space-y-4">
                  {items.map(({ product, quantity }) => {
                    const thumb = product.thumbnail && typeof product.thumbnail === "string"
                      ? `${PB_URL}/api/files/${product.collectionId}/${product.id}/${product.thumbnail}?thumb=150x150`
                      : "/images/placeholder-flower.svg";
                    const price = product.sale_price ?? product.price;
                    return (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          <Image src={thumb} alt={product.name} fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center border border-border rounded-lg overflow-hidden text-sm">
                              <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-muted">−</button>
                              <span className="w-7 text-center">{quantity}</span>
                              <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-muted">+</button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-semibold shrink-0">{formatPrice(price * quantity)}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Shipping */}
              <Card title="Shipment">
                <div className="space-y-2.5">
                  {SHIPPING_ZONES.map((zone, i) => (
                    <label key={i} className="flex items-start gap-2.5 cursor-pointer">
                      <input type="radio" name="shipping" checked={shippingIdx === i}
                        onChange={() => setShippingIdx(i)} className="mt-0.5 accent-primary" />
                      <span className="text-sm flex-1 leading-snug">{zone.label}</span>
                      {zone.fee > 0 && (
                        <span className="text-sm font-semibold text-primary shrink-0">{formatPrice(zone.fee)}</span>
                      )}
                    </label>
                  ))}
                </div>
              </Card>

              {/* Total + bank + submit */}
              <Card>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-bold text-lg">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Tạm tính · Cửa hàng sẽ báo phí ship phụ thu nếu có khi liên hệ</p>

                <div className="bg-muted/40 rounded-xl p-3.5 mb-4 text-xs space-y-0.5 leading-relaxed">
                  <p className="font-bold text-sm mb-1">CHUYỂN KHOẢN THANH TOÁN:</p>
                  <p>Sau khi chuyển khoản bạn có thể gửi thông tin nhanh:</p>
                  <p>Zalo OA: <span className="text-primary font-semibold">0976.491.322</span></p>
                  <p>để CSKH hỗ trợ check nhanh cho bạn nha:</p>
                  <p className="font-bold mt-2">CÔNG TY TNHH THƯƠNG MẠI & DỊCH VỤ VƯỜN HOA TƯƠI</p>
                  <p>– Ngân hàng: ACB Bank</p>
                  <p>– STK: 26719257</p>
                  <p>– Tên tài khoản: CTY TNHH TM DV Vườn Hoa Tươi</p>
                </div>

                {submitError && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 mb-3">{submitError}</p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                  {loading ? "Đang xử lý..." : "Đặt Hoa 🌸"}
                </button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const iCls = "w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/70";

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      {title && <h3 className="font-heading font-semibold text-base mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}
