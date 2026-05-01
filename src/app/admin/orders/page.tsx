"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import pb from "@/lib/pocketbase";
import { formatPrice } from "@/components/product/price-display";
import { Search, ChevronRight } from "lucide-react";
import type { Order } from "@/lib/types";

const STATUSES = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "delivering", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã huỷ" },
];

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  delivering: "bg-purple-500/20 text-purple-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const filters: string[] = [];
    if (statusFilter) filters.push(`status="${statusFilter}"`);
    if (search) filters.push(`customer_name~"${search}" || customer_phone~"${search}" || order_code~"${search}"`);

    pb.collection("orders").getList<Order>(page, 20, {
      sort: "-created",
      filter: filters.join(" && ") || undefined,
    }).then((result) => {
      if (!cancelled) {
        setOrders(result.items);
        setTotal(result.totalItems);
      }
    });

    return () => { cancelled = true; };
  }, [page, statusFilter, search]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Đơn hàng</h1>
        <p className="text-zinc-400 text-sm">{total} đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên, SĐT, mã đơn..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s.value} onClick={() => { setStatusFilter(s.value); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${statusFilter === s.value ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {orders === null ? (
          <div className="py-16 text-center text-zinc-500 text-sm">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">Không có đơn hàng nào</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {orders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-medium text-white">
                      {order.order_code || `#${order.id.slice(-8).toUpperCase()}`}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                      {STATUSES.find((s) => s.value === order.status)?.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {order.customer_name} · {order.customer_phone}
                    {order.delivery_date && ` · Giao: ${order.delivery_date} ${order.delivery_time}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-white">{formatPrice(order.total)}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {new Date(order.created).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 text-sm rounded-lg border transition-colors ${page === p ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
