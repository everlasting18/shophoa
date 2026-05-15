import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, TrendingUp, Clock, AlertCircle, Package, FolderOpen, ArrowRight, ChevronRight } from "lucide-react";
import pb from "@/lib/pb";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/schema/pocketbase";

export const Route = createFileRoute("/_auth/")({
  component: DashboardPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã huỷ",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  confirmed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
};

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const [recentResult, products, categories, pendingResult, todayResult, allOrders, todayOrders] = await Promise.all([
        pb.collection("orders").getList<Order>(1, 6, { sort: "-created" }),
        pb.collection("products").getList(1, 1),
        pb.collection("categories").getList(1, 1),
        pb.collection("orders").getList<Order>(1, 1, { filter: 'status="pending"' }),
        pb.collection("orders").getList<Order>(1, 1, { filter: `created>="${todayStr} 00:00:00"` }),
        pb.collection("orders").getFullList<Order>({ filter: 'status!="cancelled"' }),
        pb.collection("orders").getFullList<Order>({ filter: `created>="${todayStr} 00:00:00" && status!="cancelled"` }),
      ]);

      return {
        recentOrders: recentResult.items,
        totalOrders: recentResult.totalItems,
        totalProducts: products.totalItems,
        totalCategories: categories.totalItems,
        pending: pendingResult.totalItems,
        todayOrders: todayResult.totalItems,
        revenue: allOrders.reduce((s, o) => s + (o.total || 0), 0),
        todayRevenue: todayOrders.reduce((s, o) => s + (o.total || 0), 0),
      };
    },
    staleTime: 60_000,
  });
}

type StatCard = {
  label: string;
  value: string | number | undefined;
  sub: string;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  valueCls?: string;
};

function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  const statCards: StatCard[] = [
    {
      label: "Đơn hôm nay",
      value: data?.todayOrders,
      sub: formatPrice(data?.todayRevenue ?? 0),
      icon: Clock,
      accent: "border-l-rose-500",
      iconBg: "bg-rose-500/15 text-rose-400",
    },
    {
      label: "Chờ xác nhận",
      value: data?.pending,
      sub: "Cần xử lý ngay",
      icon: AlertCircle,
      accent: "border-l-amber-500",
      iconBg: "bg-amber-500/15 text-amber-400",
    },
    {
      label: "Tổng đơn hàng",
      value: data?.totalOrders,
      sub: "Tất cả đơn",
      icon: ShoppingBag,
      accent: "border-l-blue-500",
      iconBg: "bg-blue-500/15 text-blue-400",
    },
    {
      label: "Doanh thu",
      value: formatPrice(data?.revenue ?? 0),
      sub: "Trừ đơn đã huỷ",
      icon: TrendingUp,
      accent: "border-l-emerald-500",
      iconBg: "bg-emerald-500/15 text-emerald-400",
      valueCls: "text-xl",
    },
    {
      label: "Sản phẩm",
      value: data?.totalProducts,
      sub: "Đang trong kho",
      icon: Package,
      accent: "border-l-violet-500",
      iconBg: "bg-violet-500/15 text-violet-400",
    },
    {
      label: "Danh mục",
      value: data?.totalCategories,
      sub: "Đang hoạt động",
      icon: FolderOpen,
      accent: "border-l-stone-500",
      iconBg: "bg-stone-700 text-stone-400",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-0.5">Tổng quan cửa hàng hôm nay</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {statCards.map((c) => (
          <div
            key={c.label}
            className={`bg-stone-900 border border-stone-800/80 rounded-2xl p-5 border-l-4 ${c.accent} flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-stone-500">{c.label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                <c.icon className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-stone-800 rounded-lg animate-pulse" />
            ) : (
              <p className={`font-bold text-white leading-none ${c.valueCls ?? "text-2xl"}`}>
                {c.value ?? 0}
              </p>
            )}
            <p className="text-[11px] text-stone-600 -mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5 items-start">

        {/* Recent orders */}
        <div className="bg-stone-900 border border-stone-800/80 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/60">
            <div>
              <h2 className="text-sm font-semibold text-white">Đơn hàng gần đây</h2>
              <p className="text-[11px] text-stone-500 mt-0.5">{data?.totalOrders ?? 0} đơn tổng cộng</p>
            </div>
            <Link
              to="/orders"
              search={{ status: "" }}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="divide-y divide-stone-800/60">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-28 bg-stone-800 rounded animate-pulse" />
                    <div className="h-3 w-44 bg-stone-800 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-20 bg-stone-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : !data?.recentOrders.length ? (
            <div className="py-14 text-center">
              <ShoppingBag className="w-8 h-8 text-stone-700 mx-auto mb-3" />
              <p className="text-sm text-stone-500">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-800/40">
              {data.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/orders/$id"
                  params={{ id: order.id }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-mono font-semibold group-hover:text-rose-400 transition-colors">
                      {order.order_code || order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5 truncate">
                      {order.customer_name} · {order.customer_phone}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-white">{formatPrice(order.total)}</p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-0.5 font-medium ${STATUS_COLOR[order.status] ?? "bg-stone-700 text-stone-400"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">Truy cập nhanh</p>
          <Link
            to="/orders"
            search={{ status: "pending" }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20 hover:bg-amber-500/12 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-300">Chờ xác nhận</p>
              {isLoading ? (
                <div className="h-3 w-8 bg-amber-900/30 rounded animate-pulse mt-0.5" />
              ) : (
                <p className="text-xs text-amber-500/70 mt-0.5">{data?.pending ?? 0} đơn</p>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
          </Link>

          <Link
            to="/orders"
            search={{ status: "" }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-stone-900 border border-stone-800/80 hover:bg-stone-800/60 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-300">Tất cả đơn hàng</p>
              <p className="text-xs text-stone-600 mt-0.5">{data?.totalOrders ?? 0} đơn</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-700 group-hover:text-stone-400 transition-colors" />
          </Link>

          <Link
            to="/products/$id"
            params={{ id: "new" }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-stone-900 border border-stone-800/80 hover:bg-stone-800/60 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-300">Thêm sản phẩm</p>
              <p className="text-xs text-stone-600 mt-0.5">Tạo sản phẩm mới</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-700 group-hover:text-stone-400 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
