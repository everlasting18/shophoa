"use client";

import { useState, useEffect } from "react";
import pb from "@/services/pocketbase";
import { formatPrice } from "@/lib/utils";
import { zaloLink } from "@/config";
import { Search, Calendar, Clock, Phone, User, Package, X, MapPin, Gift, FileText, CreditCard, MessageCircle, Copy, Check, ChevronDown, PhoneCall } from "lucide-react";
import type { Order } from "@/schema";

const STATUSES = [
  { value: "", label: "Tất cả", icon: Package },
  { value: "pending", label: "Chờ xác nhận", icon: Clock, bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  { value: "confirmed", label: "Đã xác nhận", icon: Package, bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  { value: "cancelled", label: "Đã huỷ", icon: X, bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
];

function statusConfig(status: string) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const filters: string[] = [];
    if (statusFilter) filters.push(`status="${statusFilter}"`);
    if (search) {
      const safe = search.replace(/"/g, '\\"');
      filters.push(`(customer_name~"${safe}" || customer_phone~"${safe}" || order_code~"${safe}")`);
    }
    if (dateFrom) filters.push(`created>="${dateFrom} 00:00:00"`);
    if (dateTo) filters.push(`created<="${dateTo} 23:59:59"`);

    pb.collection("orders").getList<Order>(page, 20, {
      sort: "-created",
      filter: filters.join(" && ") || undefined,
    }).then((result) => {
      if (!cancelled) {
        setOrders(result.items);
        setTotal(result.totalItems);
      }
    }).catch(() => {
      if (!cancelled) setOrders([]);
    });

    return () => { cancelled = true; };
  }, [page, statusFilter, search, dateFrom, dateTo]);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      await pb.collection("orders").update(orderId, { status: newStatus });
      setOrders((prev) => prev?.map((o) => o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o) ?? null);
    } catch (e) {
      console.error("Update status failed:", e);
    } finally {
      setUpdatingId(null);
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Đơn hàng</h1>
          <p className="text-zinc-400 text-sm">{total} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); setExpandedId(null); }}
              placeholder="Tìm theo tên, SĐT, mã đơn..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => {
            const isActive = statusFilter === s.value;
            return (
              <button key={s.value} onClick={() => { setStatusFilter(isActive ? "" : s.value); setPage(1); setExpandedId(null); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  isActive ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                }`}>
                <s.icon className="w-3 h-3" />{s.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); setExpandedId(null); }}
            className="px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-600" />
          <span className="text-xs text-zinc-500">đến</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); setExpandedId(null); }}
            className="px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-600" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); setExpandedId(null); }}
              className="text-xs text-zinc-500 hover:text-zinc-300">Xoá</button>
          )}
        </div>
      </div>

      {/* Order cards */}
      {orders === null ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-52 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse ml-auto" />
                  <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">Không có đơn hàng nào</p>
          <p className="text-zinc-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => {
            const cfg = statusConfig(order.status);
            const items = Array.isArray(order.items) ? order.items : [];
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id} className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all ${
                isExpanded ? "border-rose-500/50 shadow-lg shadow-rose-500/5" : "border-zinc-800 hover:border-zinc-700"
              }`}>
                {/* Card header – clickable */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full px-5 py-4 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") setExpandedId(isExpanded ? null : order.id); }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-sm font-mono font-bold text-white">
                          {order.order_code || `#${order.id.slice(-8).toUpperCase()}`}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text} ${cfg.border} border`}>
                          <cfg.icon className="w-2.5 h-2.5" />{cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1"><User className="w-3 h-3" />{order.customer_name}</span>
                        <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{order.customer_phone}</span>
                        {order.delivery_date && (
                          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(order.delivery_date).toLocaleDateString("vi-VN")} {order.delivery_time}</span>
                        )}
                      </div>
                      {!isExpanded && items.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {items.slice(0, 3).map((item, i) => (
                            <span key={i} className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">{item.name} ×{item.quantity}</span>
                          ))}
                          {items.length > 3 && <span className="text-[10px] text-zinc-500">+{items.length - 3} SP</span>}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right flex flex-col items-end gap-2">
                      <div>
                        <p className="text-sm font-bold text-white">{formatPrice(order.total)}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{new Date(order.created).toLocaleDateString("vi-VN")} · {items.length} SP</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {order.status === "pending" && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "confirmed"); }}
                              disabled={updatingId === order.id}
                              className="text-[10px] px-2 py-1 rounded bg-green-600/20 text-green-400 hover:bg-green-600/40 transition-colors disabled:opacity-50">
                              Xác nhận
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "cancelled"); }}
                              disabled={updatingId === order.id}
                              className="text-[10px] px-2 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors disabled:opacity-50">
                              Huỷ
                            </button>
                          </>
                        )}
                        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-zinc-800">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                      <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Người đặt">
                        <p className="text-white text-sm font-medium">{order.customer_name}</p>
                        <button onClick={() => copyText(order.customer_phone, `buyer-${order.id}`)}
                          className="flex items-center gap-1 text-rose-400 text-xs hover:text-rose-300 mt-0.5">
                          <PhoneCall className="w-3 h-3" />
                          {order.customer_phone}
                          {copied === `buyer-${order.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                        </button>
                      </DetailBlock>

                      <DetailBlock icon={<Gift className="w-3.5 h-3.5" />} label="Người nhận">
                        <p className="text-white text-sm font-medium">{order.recipient_name || "—"}</p>
                        {order.recipient_phone && (
                          <button onClick={() => copyText(order.recipient_phone, `recip-${order.id}`)}
                            className="flex items-center gap-1 text-rose-400 text-xs hover:text-rose-300 mt-0.5">
                            <PhoneCall className="w-3 h-3" />
                            {order.recipient_phone}
                            {copied === `recip-${order.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                          </button>
                        )}
                      </DetailBlock>

                      <DetailBlock icon={<MapPin className="w-3.5 h-3.5" />} label="Địa chỉ">
                        <p className="text-white text-xs leading-relaxed line-clamp-2">{order.recipient_address || "—"}</p>
                        {order.recipient_address && (
                          <button onClick={() => copyText(order.recipient_address, `addr-${order.id}`)}
                            className="flex items-center gap-1 text-zinc-500 text-[10px] hover:text-white mt-0.5">
                            {copied === `addr-${order.id}` ? "Đã sao chép" : "Sao chép"}
                          </button>
                        )}
                      </DetailBlock>

                      <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Giao hàng">
                        <p className="text-white text-sm font-medium">
                          {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString("vi-VN") : "—"}
                        </p>
                        <p className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{order.delivery_time || "—"}
                        </p>
                      </DetailBlock>
                    </div>

                    {/* Products */}
                    {items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        <h4 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3">Sản phẩm ({items.length})</h4>
                        <div className="space-y-2">
                          {items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-zinc-300">{item.name} <span className="text-zinc-500">×{item.quantity}</span></span>
                              <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
                          <span className="text-zinc-400 text-sm">Tổng cộng</span>
                          <span className="text-rose-400 font-bold">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    )}

                    {/* Payment + Note */}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{order.payment_method === "bank_transfer" ? "Chuyển khoản" : order.payment_method || "—"}</span>
                      {order.note && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{order.note.length > 60 ? order.note.slice(0, 60) + "..." : order.note}</span>}
                    </div>

                    {/* Zalo actions */}
                    <div className="flex gap-2 mt-4">
                      <a href={zaloLink(order.customer_phone)} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-lg transition-colors border border-blue-500/20">
                        <MessageCircle className="w-3.5 h-3.5" />Zalo người đặt
                      </a>
                      {order.recipient_phone && order.recipient_phone !== order.customer_phone && (
                        <a href={zaloLink(order.recipient_phone)} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-1.5 flex-1 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400/80 text-xs font-medium rounded-lg transition-colors border border-blue-500/10">
                          <MessageCircle className="w-3.5 h-3.5" />Zalo người nhận
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 text-sm">
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 text-sm rounded-lg border transition-colors ${page === p ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 text-sm">
            ›
          </button>
        </div>
      )}
    </div>
  );
}

function DetailBlock({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">{icon}{label}</p>
      {children}
    </div>
  );
}
