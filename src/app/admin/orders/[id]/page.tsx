"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pocketbase";
import { formatPrice } from "@/components/product/price-display";
import { ChevronLeft, Phone } from "lucide-react";
import type { Order } from "@/lib/types";

const STATUSES = [
  { value: "pending", label: "Chờ xác nhận", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "confirmed", label: "Đã xác nhận", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "delivering", label: "Đang giao", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "completed", label: "Hoàn thành", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "cancelled", label: "Đã huỷ", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    pb.collection("orders").getOne<Order>(id).then(setOrder);
  }, [id]);

  async function updateStatus(status: string) {
    if (!order) return;
    setSaving(true);
    await pb.collection("orders").update(id, { status });
    setOrder({ ...order, status: status as Order["status"] });
    setSaving(false);
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentStatus = STATUSES.find((s) => s.value === order.status);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">
            {order.order_code || `#${order.id.slice(-8).toUpperCase()}`}
          </h1>
          <p className="text-zinc-400 text-xs mt-0.5">
            {new Date(order.created).toLocaleString("vi-VN")}
          </p>
        </div>
        <span className={`ml-auto text-xs px-2.5 py-1 rounded-full border ${currentStatus?.color}`}>
          {currentStatus?.label}
        </span>
      </div>

      {/* Status update */}
      <Card title="Cập nhật trạng thái">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s.value} onClick={() => updateStatus(s.value)} disabled={saving || order.status === s.value}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-50 ${
                order.status === s.value
                  ? s.color
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Customer info */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Người đặt">
          <p className="text-white text-sm font-medium">{order.customer_name}</p>
          <a href={`tel:${order.customer_phone}`}
            className="flex items-center gap-1.5 text-rose-400 text-sm mt-1 hover:text-rose-300">
            <Phone className="w-3.5 h-3.5" />{order.customer_phone}
          </a>
        </Card>
        <Card title="Người nhận">
          <p className="text-white text-sm font-medium">{order.recipient_name}</p>
          <a href={`tel:${order.recipient_phone}`}
            className="flex items-center gap-1.5 text-rose-400 text-sm mt-1 hover:text-rose-300">
            <Phone className="w-3.5 h-3.5" />{order.recipient_phone}
          </a>
          <p className="text-zinc-400 text-xs mt-1">{order.recipient_address}</p>
        </Card>
      </div>

      {/* Delivery */}
      <Card title="Thời gian giao">
        <p className="text-white text-sm">
          📅 {order.delivery_date} &nbsp; 🕐 {order.delivery_time}
        </p>
      </Card>

      {/* Items */}
      <Card title="Sản phẩm">
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <div>
                <p className="text-white">{item.name}</p>
                <p className="text-zinc-500 text-xs">x{item.quantity} · {formatPrice(item.price)}/cái</p>
              </div>
              <p className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-800 mt-4 pt-4 flex justify-between">
          <span className="text-zinc-400 text-sm">Tổng cộng</span>
          <span className="text-white font-bold">{formatPrice(order.total)}</span>
        </div>
      </Card>

      {/* Note */}
      {order.note && (
        <Card title="Ghi chú">
          <p className="text-zinc-300 text-sm">{order.note}</p>
        </Card>
      )}

      {/* Zalo shortcut */}
      <a href={`https://zalo.me/${order.customer_phone}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors">
        💬 Nhắn Zalo cho khách
      </a>
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      {title && <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">{title}</p>}
      {children}
    </div>
  );
}
