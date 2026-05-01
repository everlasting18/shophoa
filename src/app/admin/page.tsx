"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import pb from "@/lib/pocketbase";
import { ShoppingBag, Package, FolderOpen, TrendingUp, Clock } from "lucide-react";
import { formatPrice } from "@/components/product/price-display";
import type { Order } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  delivering: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  delivering: "bg-purple-500/20 text-purple-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, categories: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [orders, products, categories] = await Promise.all([
          pb.collection("orders").getList<Order>(1, 5, { sort: "-created" }),
          pb.collection("products").getList(1, 1),
          pb.collection("categories").getList(1, 1),
        ]);

        const allOrders = await pb.collection("orders").getFullList<Order>({
          filter: 'status != "cancelled"',
        });
        const revenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);

        setStats({
          orders: orders.totalItems,
          products: products.totalItems,
          categories: categories.totalItems,
          revenue,
        });
        setRecentOrders(orders.items);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    { label: "Tổng đơn hàng", value: stats.orders, icon: ShoppingBag, color: "text-rose-400", href: "/admin/orders" },
    { label: "Sản phẩm", value: stats.products, icon: Package, color: "text-blue-400", href: "/admin/products" },
    { label: "Danh mục", value: stats.categories, icon: FolderOpen, color: "text-green-400", href: "/admin/categories" },
    { label: "Doanh thu (ước tính)", value: formatPrice(stats.revenue), icon: TrendingUp, color: "text-yellow-400", href: "/admin/orders" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Tổng quan cửa hàng</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-400">{c.label}</p>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className={`text-xl font-bold ${loading ? "text-zinc-600 animate-pulse" : "text-white"}`}>
              {loading ? "—" : c.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white">Đơn hàng gần đây</h2>
          <Link href="/admin/orders" className="text-xs text-rose-400 hover:text-rose-300">Xem tất cả →</Link>
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
                  <p className="text-sm text-white font-medium">{order.order_code || order.id.slice(-8).toUpperCase()}</p>
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

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/products/new"
          className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-rose-500/40 transition-colors text-sm text-zinc-300 hover:text-white">
          <Package className="w-4 h-4 text-rose-400" /> Thêm sản phẩm mới
        </Link>
        <Link href="/admin/orders?status=pending"
          className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-yellow-500/40 transition-colors text-sm text-zinc-300 hover:text-white">
          <Clock className="w-4 h-4 text-yellow-400" /> Đơn chờ xác nhận
        </Link>
      </div>
    </div>
  );
}
