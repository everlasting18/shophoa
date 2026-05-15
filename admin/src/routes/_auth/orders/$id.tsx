import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft, Phone, User, MapPin, Calendar, Clock, Package,
  FileText, Copy, Check, MessageCircle, Gift, CreditCard,
} from "lucide-react";
import { useState } from "react";
import { useOrder, useUpdateOrderStatus } from "@/features/orders/api";
import { formatPrice } from "@/lib/utils";
import { PHOTO_BASE, zaloLink } from "@/lib/config";
import type { OrderItem } from "@/schema/pocketbase";

export const Route = createFileRoute("/_auth/orders/$id")({
  component: OrderDetailPage,
  
});

const STATUSES = [
  { value: "pending",   label: "Chờ xác nhận", color: "bg-amber-500",  text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30" },
  { value: "confirmed", label: "Đã xác nhận",  color: "bg-green-500",  text: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30" },
  { value: "cancelled", label: "Đã huỷ",       color: "bg-red-500",    text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30" },
];

const NEXT_STATUS: Record<string, { value: string; label: string; btnClass: string } | null> = {
  pending:   { value: "confirmed", label: "Xác nhận đơn", btnClass: "bg-green-600 hover:bg-green-500 text-white" },
  confirmed: null,
  cancelled: null,
};

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const [copied, setCopied] = useState<string | null>(null);

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-stone-400">Không tìm thấy đơn hàng</p>
        <Link to="/orders" search={{ status: "" }} className="text-rose-400 text-sm mt-2 inline-block hover:text-rose-300">← Quay lại</Link>
      </div>
    );
  }

  const current = STATUSES.find((s) => s.value === order.status) ?? STATUSES[0];
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const next = NEXT_STATUS[order.status];
  const shippingFee = (order.total ?? 0) - (order.subtotal ?? 0);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/orders" search={{ status: "" }} className="hidden lg:block text-stone-400 hover:text-white transition-colors shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white font-mono truncate">
            {order.order_code || `#${order.id.slice(-8).toUpperCase()}`}
          </h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-stone-500">Tạo lúc {new Date(order.created).toLocaleString("vi-VN")}</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${current.color}`} />
              {current.label}
            </span>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 print:hidden">
        <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />Tiến trình
        </h3>
        <div className="flex items-center">
          {STATUSES.filter((s) => s.value !== "cancelled").map((s, i, arr) => {
            const orderIdx = STATUSES.findIndex((st) => st.value === order.status);
            const stepIdx = STATUSES.findIndex((st) => st.value === s.value);
            const isActive = stepIdx <= orderIdx && order.status !== "cancelled";
            const nextStep = arr[i + 1];
            const nextActive = nextStep && STATUSES.findIndex((st) => st.value === nextStep.value) <= orderIdx && order.status !== "cancelled";
            return (
              <div key={s.value} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? `${s.color} text-white` : "bg-stone-800 text-stone-600"}`}>
                    {i + 1}
                  </span>
                  <span className={`text-[10px] mt-1.5 text-center ${isActive ? "text-white font-medium" : "text-stone-500"}`}>{s.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full ${nextActive ? nextStep.color : "bg-stone-800"}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex gap-2">
          {next && (
            <button
              onClick={() => updateStatus.mutate({ id: order.id, status: next.value })}
              disabled={updateStatus.isPending}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${next.btnClass}`}
            >
              {updateStatus.isPending ? "Đang lưu..." : next.label}
            </button>
          )}
          {order.status === "pending" && (
            <button
              onClick={() => updateStatus.mutate({ id: order.id, status: "cancelled" })}
              disabled={updateStatus.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              Huỷ đơn
            </button>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardTitle icon={<User className="w-3.5 h-3.5" />}>Người đặt</CardTitle>
          <p className="text-white text-sm font-semibold">{order.customer_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1 text-rose-400 text-sm hover:text-rose-300">
              <Phone className="w-3 h-3" />{order.customer_phone}
            </a>
            <CopyBtn text={order.customer_phone} id="phone" copied={copied} onCopy={copyText} />
          </div>
        </Card>

        <Card>
          <CardTitle icon={<Gift className="w-3.5 h-3.5" />}>Người nhận</CardTitle>
          <p className="text-white text-sm font-semibold">{order.recipient_name || "—"}</p>
          {order.recipient_phone && (
            <div className="flex items-center gap-2 mt-1">
              <a href={`tel:${order.recipient_phone}`} className="flex items-center gap-1 text-rose-400 text-sm hover:text-rose-300">
                <Phone className="w-3 h-3" />{order.recipient_phone}
              </a>
              <CopyBtn text={order.recipient_phone} id="recipientPhone" copied={copied} onCopy={copyText} />
            </div>
          )}
        </Card>

        <Card>
          <CardTitle icon={<MapPin className="w-3.5 h-3.5" />}>Địa chỉ giao</CardTitle>
          <p className="text-white text-sm leading-relaxed">{order.recipient_address}</p>
          <button onClick={() => copyText(order.recipient_address, "address")}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-white mt-1.5 transition-colors">
            {copied === "address" ? <><Check className="w-3 h-3 text-green-400" />Đã sao chép</> : <><Copy className="w-3 h-3" />Sao chép</>}
          </button>
        </Card>

        <Card>
          <CardTitle icon={<Calendar className="w-3.5 h-3.5" />}>Thời gian giao</CardTitle>
          <p className="text-white text-sm font-semibold">
            {order.delivery_date
              ? new Date(order.delivery_date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })
              : "—"}
          </p>
          <p className="text-stone-400 text-xs mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />{order.delivery_time || "Chưa chọn giờ"}
          </p>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <CardTitle icon={<Package className="w-3.5 h-3.5" />}>Sản phẩm ({items.length})</CardTitle>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-stone-800 last:border-0 last:pb-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-800 shrink-0 border border-stone-700">
                {item.thumbnail && item.product_id ? (
                  <img src={`${PHOTO_BASE}/${item.collectionId || "products"}/${item.product_id}/${item.thumbnail}`}
                    alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-stone-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">{formatPrice(item.price)} × {item.quantity}</p>
              </div>
              <p className="text-white font-semibold text-sm shrink-0">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-stone-800 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-stone-400">Tạm tính</span><span className="text-white">{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-stone-400">Phí vận chuyển</span><span className="text-white">{formatPrice(shippingFee)}</span></div>
          <div className="flex justify-between pt-2 border-t border-stone-700">
            <span className="text-white font-bold">Tổng cộng</span>
            <span className="text-lg font-bold text-rose-400">{formatPrice(order.total)}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle icon={<CreditCard className="w-3.5 h-3.5" />}>Thanh toán</CardTitle>
        <p className="text-white text-sm">
          {order.payment_method === "bank_transfer" ? "Chuyển khoản ngân hàng" : order.payment_method || "—"}
        </p>
      </Card>

      {order.note && (
        <Card>
          <CardTitle icon={<FileText className="w-3.5 h-3.5" />}>Ghi chú</CardTitle>
          <p className="text-stone-300 text-sm whitespace-pre-wrap">{order.note}</p>
        </Card>
      )}

      {/* Zalo */}
      <div className="flex gap-2">
        <a href={zaloLink(order.customer_phone)} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors">
          <MessageCircle className="w-4 h-4" />Nhắn Zalo người đặt
        </a>
        {order.recipient_phone && order.recipient_phone !== order.customer_phone && (
          <a href={zaloLink(order.recipient_phone)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-sm font-medium rounded-xl transition-colors border border-blue-500/30">
            <MessageCircle className="w-4 h-4" />Nhắn Zalo người nhận
          </a>
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">{children}</div>;
}

function CardTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-3">
      {icon}{children}
    </h3>
  );
}

function CopyBtn({ text, id, copied, onCopy }: { text: string; id: string; copied: string | null; onCopy: (t: string, id: string) => void }) {
  return (
    <button onClick={() => onCopy(text, id)} className="text-stone-500 hover:text-white transition-colors">
      {copied === id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}
