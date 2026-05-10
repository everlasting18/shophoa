"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import pb from "@/services/pocketbase";
import { formatPrice } from "@/lib/utils";
import { zaloLink } from "@/config";
import { ChevronLeft, Phone, User, MapPin, Calendar, Clock, Package, FileText, Copy, Check, MessageCircle, Gift, CreditCard } from "lucide-react";
import type { Order } from "@/schema";

const STATUSES = [
  { value: "pending", label: "Chờ xác nhận", color: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { value: "confirmed", label: "Đã xác nhận", color: "bg-green-500", text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  { value: "cancelled", label: "Đã huỷ", color: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
];

const NEXT_STATUS: Record<string, { value: string; label: string; color: string } | null> = {
  pending: { value: "confirmed", label: "Xác nhận đơn", color: "bg-green-500 hover:bg-green-600" },
  confirmed: null,
  cancelled: null,
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    pb.collection("orders").getOne<Order>(id).then(setOrder).catch(() => {});
  }, [id]);

  async function updateStatus(status: string) {
    if (!order) return;
    setSaving(true);
    try {
      await pb.collection("orders").update(id, { status });
      setOrder({ ...order, status: status as Order["status"] });
    } catch (e) {
      console.error("Update status failed:", e);
    } finally {
      setSaving(false);
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const current = STATUSES.find((s) => s.value === order.status)!;
  const items = Array.isArray(order.items) ? order.items : [];
  const next = NEXT_STATUS[order.status];

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white font-mono">
            {order.order_code || `#${order.id.slice(-8).toUpperCase()}`}
          </h1>
          <p className="text-xs text-zinc-500">
            Tạo lúc {new Date(order.created).toLocaleString("vi-VN")}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${current.bg} ${current.text} ${current.border}`}>
          <span className={`w-2 h-2 rounded-full ${current.color}`} />
          {current.label}
        </span>
      </div>

      {/* Status timeline */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Tiến trình
        </h3>
        <div className="flex items-center">
          {STATUSES.filter((s) => s.value !== "cancelled").map((s, i) => {
            const idx = STATUSES.findIndex((st) => st.value === order.status);
            const isActive = STATUSES.findIndex((st) => st.value === s.value) <= idx && order.status !== "cancelled";
            const isCancelled = order.status === "cancelled";
            return (
              <div key={s.value} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCancelled ? "bg-zinc-800 text-zinc-600" :
                    isActive ? `${s.color} text-white` : "bg-zinc-800 text-zinc-600"
                  }`}>
                    {i + 1}
                  </span>
                  <span className={`text-[10px] mt-1.5 text-center ${isActive && !isCancelled ? "text-white font-medium" : "text-zinc-500"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STATUSES.filter((x) => x.value !== "cancelled").length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${isActive && !isCancelled ? "" : "bg-zinc-800"}`}
                    style={isActive && !isCancelled && STATUSES.filter((st) => st.value !== "cancelled")[i + 1] &&
                      STATUSES.findIndex((st) => st.value === STATUSES.filter((x) => x.value !== "cancelled")[i + 1].value) <= idx
                      ? { background: STATUSES.filter((st) => st.value !== "cancelled")[i + 1].color }
                      : undefined}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div className="mt-5 flex gap-2">
          {next && (
            <button onClick={() => updateStatus(next.value)} disabled={saving}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${next.color}`}>
              {saving ? "Đang lưu..." : next.label}
            </button>
          )}
          {order.status === "pending" && (
            <button onClick={() => updateStatus("cancelled")} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50">
              Huỷ đơn
            </button>
          )}
        </div>
      </div>

      {/* Customer + Delivery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer */}
        <Card>
          <h3 className="flex items-center gap-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3"><User className="w-3.5 h-3.5" /> Người đặt</h3>
          <p className="text-white text-sm font-semibold">{order.customer_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <a href={`tel:${order.customer_phone}`}
              className="flex items-center gap-1 text-rose-400 text-sm hover:text-rose-300">
              <Phone className="w-3 h-3" />{order.customer_phone}
            </a>
            <button onClick={() => copyText(order.customer_phone, "phone")}
              className="text-zinc-500 hover:text-white transition-colors">
              {copied === "phone" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </Card>

        {/* Recipient */}
        <Card>
          <h3 className="flex items-center gap-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3"><Gift className="w-3.5 h-3.5" /> Người nhận</h3>
          <p className="text-white text-sm font-semibold">{order.recipient_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <a href={`tel:${order.recipient_phone}`}
              className="flex items-center gap-1 text-rose-400 text-sm hover:text-rose-300">
              <Phone className="w-3 h-3" />{order.recipient_phone}
            </a>
            <button onClick={() => copyText(order.recipient_phone, "recipientPhone")}
              className="text-zinc-500 hover:text-white transition-colors">
              {copied === "recipientPhone" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </Card>

        {/* Address */}
        <Card>
          <h3 className="flex items-center gap-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3"><MapPin className="w-3.5 h-3.5" /> Địa chỉ giao</h3>
          <p className="text-white text-sm leading-relaxed">{order.recipient_address}</p>
          <button onClick={() => copyText(order.recipient_address, "address")}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white mt-1.5 transition-colors">
            {copied === "address" ? <><Check className="w-3 h-3 text-green-400" /> Đã sao chép</> : <><Copy className="w-3 h-3" /> Sao chép</>}
          </button>
        </Card>

        {/* Delivery time */}
        <Card>
          <h3 className="flex items-center gap-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3"><Calendar className="w-3.5 h-3.5" /> Thời gian giao</h3>
          <p className="text-white text-sm font-semibold">
            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
          </p>
          <p className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {order.delivery_time || "Chưa chọn giờ"}
          </p>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <h3 className="flex items-center gap-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3"><Package className="w-3.5 h-3.5" /> Sản phẩm ({items.length})</h3>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{item.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="text-white font-semibold text-sm ml-4">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800">
          <span className="text-zinc-400 text-sm">Tạm tính</span>
          <span className="text-white font-semibold">{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-zinc-400 text-sm">Phí vận chuyển</span>
          <span className="text-white">{formatPrice((order.total || 0) - (order.subtotal || 0))}</span>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-700">
          <span className="text-white font-bold">Tổng cộng</span>
          <span className="text-lg font-bold text-rose-400">{formatPrice(order.total)}</span>
        </div>
      </Card>

      {/* Payment */}
      <Card>
        <h3 className="flex items-center gap-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3"><CreditCard className="w-3.5 h-3.5" /> Thanh toán</h3>
        <p className="text-white text-sm capitalize">
          {order.payment_method === "bank_transfer" ? "Chuyển khoản ngân hàng" :
           order.payment_method === "cod" ? "Thanh toán khi nhận hàng" :
           order.payment_method === "momo" ? "Ví MoMo" : order.payment_method || "—"}
        </p>
      </Card>

      {/* Note */}
      {order.note && (
        <Card>
          <h3 className="flex items-center gap-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3"><FileText className="w-3.5 h-3.5" /> Ghi chú</h3>
          <p className="text-zinc-300 text-sm whitespace-pre-wrap">{order.note}</p>
        </Card>
      )}

      {/* Zalo button */}
      <div className="flex gap-2">
        <a href={zaloLink(order.customer_phone)} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors">
          <MessageCircle className="w-4 h-4" />
          Nhắn Zalo người đặt
        </a>
        {order.recipient_phone && order.recipient_phone !== order.customer_phone && (
          <a href={zaloLink(order.recipient_phone)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-sm font-medium rounded-xl transition-colors border border-blue-500/30">
            <MessageCircle className="w-4 h-4" />
            Nhắn Zalo người nhận
          </a>
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      {children}
    </div>
  );
}
