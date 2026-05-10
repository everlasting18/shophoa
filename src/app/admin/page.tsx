"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import pb from "@/services/pocketbase";
import { ShoppingBag, TrendingUp, Clock, AlertCircle, Package, FolderOpen, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/schema";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã huỷ",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, categories: 0, revenue: 0, pending: 0, todayOrders: 0, todayRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const [ordersResult, products, categories, pendingResult, todayResult, allOrders] = await Promise.all([
          pb.collection("orders").getList<Order>(1, 5, { sort: "-created" }),
          pb.collection("products").getList(1, 1),
          pb.collection("categories").getList(1, 1),
          pb.collection("orders").getList<Order>(1, 1, { filter: 'status="pending"' }),
          pb.collection("orders").getList<Order>(1, 1, { filter: `created>="${todayStr} 00:00:00"` }),
          pb.collection("orders").getFullList<Order>({ filter: 'status!="cancelled"' }),
        ]);

        const revenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);

        let todayRevenue = 0;
        try {
          const todayOrders = await pb.collection("orders").getFullList<Order>({
            filter: `created>="${todayStr} 00:00:00" && status!="cancelled"`,
          });
          todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
        } catch {
          // ignore
        }

        setStats({
          orders: ordersResult.totalItems,
          products: products.totalItems,
          categories: categories.totalItems,
          revenue,
          pending: pendingResult.totalItems,
          todayOrders: todayResult.totalItems,
          todayRevenue,
        });
        setRecentOrders(ordersResult.items);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: "Đơn hôm nay", value: stats.todayOrders, sub: `${formatPrice(stats.todayRevenue)}`, icon: Clock, color: "from-rose-500/20 to-rose-600/5", iconColor: "text-rose-400", border: "border-rose-500/20" },
    { label: "Chờ xác nhận", value: stats.pending, sub: "Cần xử lý", icon: AlertCircle, color: "from-yellow-500/20 to-yellow-600/5", iconColor: "text-yellow-400", border: "border-yellow-500/20" },
    { label: "Tổng đơn hàng", value: stats.orders, sub: "Tất cả", icon: ShoppingBag, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400", border: "border-blue-500/20" },
    { label: "Doanh thu", value: formatPrice(stats.revenue), sub: "Trừ đơn huỷ", icon: TrendingUp, color: "from-green-500/20 to-green-600/5", iconColor: "text-green-400", border: "border-green-500/20" },
    { label: "Sản phẩm", value: stats.products, sub: "Đang bán", icon: Package, color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400", border: "border-purple-500/20" },
    { label: "Danh mục", value: stats.categories, sub: "Đang hoạt động", icon: FolderOpen, color: "from-zinc-500/20 to-zinc-600/5", iconColor: "text-zinc-400", border: "border-zinc-500/20" },
  ];

  const recentLinks = [
    { label: "Đơn chờ xác nhận", href: "/admin/orders?status=pending", icon: AlertCircle, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    { label: "Xem tất cả đơn hàng", href: "/admin/orders", icon: ShoppingBag, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Tổng quan cửa hàng</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {statCards.map((c) => (
          <div key={c.label}
            className={`bg-zinc-900 border rounded-xl p-4 bg-gradient-to-br ${c.color} ${c.border}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-400">{c.label}</p>
              <c.icon className={`w-4 h-4 ${c.iconColor}`} />
            </div>
            <p className={`text-xl font-bold ${loading ? "text-zinc-600 animate-pulse" : "text-white"}`}>
              {loading ? "—" : c.value}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Recent orders */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">Đơn hàng gần đây</h2>
            <Link href="/admin/orders" className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-center text-zinc-500 text-sm">Đang tải...</div>
          ) : recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-zinc-500 text-sm">Chưa có đơn hàng nào</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-mono font-medium">{order.order_code || order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{order.customer_name} · {order.customer_phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white">{formatPrice(order.total)}</p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-0.5 ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          {recentLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${l.color} hover:opacity-80`}>
              <l.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{l.label}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-60" />
            </Link>
          ))}

          <Link href="/admin/products/new"
            className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-sm text-zinc-300">
            <Package className="w-4 h-4 text-zinc-400" />
            <span>Thêm sản phẩm mới</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-60" />
          </Link>
        </div>
      </div>
    </div>
  );
}
