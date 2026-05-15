import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, X, Package, AlertCircle, CheckCircle2, XCircle,
  User, Phone, Truck, Check, ChevronDown, ExternalLink,
  MapPin, Gift, Clock, FileText, CreditCard, MessageCircle,
  PhoneCall, Copy,
} from "lucide-react";
import { useOrders, useUpdateOrderStatus } from "@/features/orders/api";
import { formatPrice, useDebounce } from "@/lib/utils";
import { PHOTO_BASE, zaloLink } from "@/lib/config";
import type { Order, OrderItem } from "@/schema/pocketbase";

export const Route = createFileRoute("/_auth/orders/")({
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string) ?? "",
  }),
  component: OrdersPage,
});

const STATUSES = [
  { value: "", label: "Tất cả", icon: Package },
  { value: "pending", label: "Chờ xác nhận", icon: AlertCircle },
  { value: "confirmed", label: "Đã xác nhận", icon: CheckCircle2 },
  { value: "cancelled", label: "Đã huỷ", icon: XCircle },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; leftBorder: string; icon: typeof AlertCircle }> = {
  pending:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   leftBorder: "border-l-amber-500",   icon: AlertCircle },
  confirmed: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", leftBorder: "border-l-emerald-500", icon: CheckCircle2 },
  cancelled: { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20",     leftBorder: "border-l-red-500",     icon: XCircle },
};

function getStatusStyle(status: string) {
  return STATUS_STYLE[status] ?? { bg: "bg-stone-500/10", text: "text-stone-400", border: "border-stone-500/20", leftBorder: "border-l-stone-600", icon: Package };
}

function OrdersPage() {
  const { status: initialStatus } = Route.useSearch();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);
  const { data, isLoading } = useOrders({ page, status, search: debouncedSearch, dateFrom, dateTo });
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.items ?? [];
  const total = data?.totalItems ?? 0;
  const totalPages = data?.totalPages ?? 0;

  function resetPage() { setPage(1); setExpandedId(null); }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Đơn hàng</h1>
        <p className="text-stone-500 text-sm mt-0.5">{total} đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            placeholder="Tên, SĐT, mã đơn..."
            className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-stone-600"
          />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
            className="w-full px-2.5 py-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-none focus:border-stone-600" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
            className="w-full px-2.5 py-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-none focus:border-stone-600" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); resetPage(); }}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-stone-400 hover:text-white bg-stone-800 border border-stone-700 transition-colors">
              <X className="w-3.5 h-3.5" /> Xoá ngày
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
          {STATUSES.map((s) => {
            const isActive = status === s.value;
            return (
              <button key={s.value} onClick={() => { setStatus(isActive ? "" : s.value); resetPage(); }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                  isActive ? "bg-rose-600 border-rose-600 text-white" : "bg-stone-800 border-stone-700 text-stone-400 hover:text-white hover:border-stone-600"
                }`}>
                <s.icon className="w-3 h-3" />{s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-5 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2"><div className="h-4 w-28 bg-stone-800 rounded" /><div className="h-3 w-48 bg-stone-800 rounded" /></div>
                <div className="h-4 w-20 bg-stone-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="w-10 h-10 text-stone-700 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">Không có đơn hàng</p>
          <p className="text-stone-600 text-sm mt-1">Thử thay đổi bộ lọc</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map((order) => {
            const cfg = getStatusStyle(order.status);
            const StatusIcon = cfg.icon;
            const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id} className={`bg-stone-900 border border-stone-800 rounded-xl overflow-hidden border-l-4 ${cfg.leftBorder} ${isExpanded ? "shadow-lg shadow-black/20" : ""}`}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="px-4 sm:px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") setExpandedId(isExpanded ? null : order.id); }}
                >
                  {/* Row 1: code + status + price */}
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-white">
                        {order.order_code || `#${order.id.slice(-8).toUpperCase()}`}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        {STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-white text-sm">{formatPrice(order.total)}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">{items.length} SP</p>
                    </div>
                  </div>

                  {/* Row 2: customer info + date */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-400 min-w-0">
                      <span className="flex items-center gap-1 truncate"><User className="w-3 h-3 shrink-0" />{order.customer_name}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{order.customer_phone}</span>
                    </div>
                    {order.delivery_date && (
                      <span className="flex items-center gap-1 text-[11px] text-stone-500 shrink-0">
                        <Truck className="w-3 h-3" />
                        {new Date(order.delivery_date).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>

                  {/* Row 3: items preview */}
                  {!isExpanded && items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {items.slice(0, 3).map((item, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                          {item.name} ×{item.quantity}
                        </span>
                      ))}
                      {items.length > 3 && <span className="text-[10px] text-stone-600">+{items.length - 3}</span>}
                    </div>
                  )}

                  {/* Row 4: action buttons */}
                  <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: order.id, status: "confirmed" }); }}
                          disabled={updateStatus.isPending}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 transition-colors disabled:opacity-50 font-medium"
                        >
                          <Check className="w-3.5 h-3.5" /> Xác nhận
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: order.id, status: "cancelled" }); }}
                          disabled={updateStatus.isPending}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 transition-colors disabled:opacity-50 font-medium"
                        >
                          <X className="w-3.5 h-3.5" /> Huỷ
                        </button>
                      </>
                    )}
                    <Link
                      to="/orders/$id"
                      params={{ id: order.id }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-stone-800 text-stone-400 hover:text-white border border-stone-700 transition-colors font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Chi tiết
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : order.id); }}
                      className="ml-auto w-9 h-9 flex items-center justify-center rounded-lg bg-stone-800 border border-stone-700 text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <ExpandedOrder order={order} items={items} copied={copied} onCopy={copyText} />
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
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-800 text-stone-400 hover:text-white disabled:opacity-30 text-sm">‹</button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            let pg: number;
            if (totalPages <= 10) pg = i + 1;
            else if (page <= 5) pg = i + 1;
            else if (page >= totalPages - 4) pg = totalPages - 9 + i;
            else pg = page - 5 + i;
            return (
              <button key={pg} onClick={() => setPage(pg)}
                className={`w-8 h-8 text-sm rounded-lg border transition-colors ${page === pg ? "bg-rose-600 border-rose-600 text-white" : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"}`}>
                {pg}
              </button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-800 text-stone-400 hover:text-white disabled:opacity-30 text-sm">›</button>
        </div>
      )}
    </div>
  );
}

function ExpandedOrder({ order, items, copied, onCopy }: {
  order: Order;
  items: OrderItem[];
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div className="border-t border-stone-800 bg-stone-950/50">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-stone-800">
        <InfoCell label="Người đặt" icon={<User className="w-3.5 h-3.5" />}>
          <p className="text-white text-sm font-semibold">{order.customer_name}</p>
          <CopyBtn text={order.customer_phone} id={`buyer-${order.id}`} copied={copied} onCopy={onCopy}>
            <PhoneCall className="w-3 h-3" />{order.customer_phone}
          </CopyBtn>
        </InfoCell>

        <InfoCell label="Người nhận" icon={<Gift className="w-3.5 h-3.5" />}>
          <p className="text-white text-sm font-semibold">{order.recipient_name || "—"}</p>
          {order.recipient_phone && (
            <CopyBtn text={order.recipient_phone} id={`recip-${order.id}`} copied={copied} onCopy={onCopy}>
              <PhoneCall className="w-3 h-3" />{order.recipient_phone}
            </CopyBtn>
          )}
        </InfoCell>

        <InfoCell label="Địa chỉ giao" icon={<MapPin className="w-3.5 h-3.5" />}>
          <p className="text-white text-xs leading-relaxed">{order.recipient_address || "—"}</p>
          {order.recipient_address && (
            <CopyBtn text={order.recipient_address} id={`addr-${order.id}`} copied={copied} onCopy={onCopy}>
              <Copy className="w-3 h-3" />Sao chép
            </CopyBtn>
          )}
        </InfoCell>

        <InfoCell label="Giao hàng" icon={<Truck className="w-3.5 h-3.5" />}>
          <p className="text-white text-sm font-semibold">
            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString("vi-VN") : "—"}
          </p>
          <p className="text-stone-400 text-xs flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />{order.delivery_time || "Chưa chọn giờ"}
          </p>
        </InfoCell>
      </div>

      {items.length > 0 && (
        <div className="px-5 py-4 border-t border-stone-800">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">Sản phẩm ({items.length})</p>
          <div className="space-y-2.5">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-stone-800 shrink-0 border border-stone-700">
                  {item.thumbnail && item.product_id ? (
                    <img
                      src={`${PHOTO_BASE}/${item.collectionId || "products"}/${item.product_id}/${item.thumbnail}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-stone-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-200 truncate">{item.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">×{item.quantity} · {formatPrice(item.price)}/sp</p>
                </div>
                <span className="text-sm font-semibold text-white shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-800">
            <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {order.payment_method === "bank_transfer" ? "Chuyển khoản" : order.payment_method || "—"}
              </span>
              {order.note && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {order.note.length > 50 ? order.note.slice(0, 50) + "…" : order.note}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500">Tổng cộng</p>
              <p className="text-lg font-bold text-rose-400">{formatPrice(order.total)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pb-4 flex gap-2">
        <a href={zaloLink(order.customer_phone)} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg bg-[#0068FF]/10 hover:bg-[#0068FF]/20 text-[#4d9fff] text-xs font-medium transition-colors border border-[#0068FF]/20">
          <MessageCircle className="w-3.5 h-3.5" />Zalo người đặt
        </a>
        {order.recipient_phone && order.recipient_phone !== order.customer_phone && (
          <a href={zaloLink(order.recipient_phone)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs font-medium transition-colors border border-stone-700">
            <MessageCircle className="w-3.5 h-3.5" />Zalo người nhận
          </a>
        )}
      </div>
    </div>
  );
}

function InfoCell({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-stone-950/60 px-4 py-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-2">{icon}{label}</p>
      {children}
    </div>
  );
}

function CopyBtn({ text, id, copied, onCopy, children }: {
  text: string; id: string; copied: string | null;
  onCopy: (text: string, id: string) => void; children: React.ReactNode;
}) {
  return (
    <button onClick={() => onCopy(text, id)} className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-xs mt-0.5 transition-colors">
      {copied === id ? <><Check className="w-3 h-3 text-emerald-400" />Đã sao chép</> : children}
    </button>
  );
}
