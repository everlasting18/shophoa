import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, AlertCircle, ChevronRight, ArrowRight } from "lucide-react";
import pb from "@/lib/pb";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/schema/pocketbase";

export const Route = createFileRoute("/_auth/")({
  component: DashboardPage,
});

export const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã huỷ",
};

export const STATUS_COLOR: Record<string, string> = {
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
      const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

      const [recentResult, pendingResult, todayOrders, monthOrders, allOrders] = await Promise.all([
        pb.collection("orders").getList<Order>(1, 10, { sort: "-created" }),
        pb.collection("orders").getList<Order>(1, 1, { filter: 'status="pending"' }),
        pb.collection("orders").getFullList<Order>({ filter: `created>="${todayStr} 00:00:00" && status!="cancelled"` }),
        pb.collection("orders").getFullList<Order>({ filter: `created>="${monthStr} 00:00:00" && status!="cancelled"` }),
        pb.collection("orders").getFullList<Order>({ filter: 'status!="cancelled"' }),
      ]);

      return {
        recentOrders: recentResult.items,
        totalOrders: recentResult.totalItems,
        pending: pendingResult.totalItems,
        todayCount: todayOrders.length,
        todayRevenue: todayOrders.reduce((s, o) => s + (o.total || 0), 0),
        monthRevenue: monthOrders.reduce((s, o) => s + (o.total || 0), 0),
        allRevenue: allOrders.reduce((s, o) => s + (o.total || 0), 0),
      };
    },
    staleTime: 30_000,
  });
}

function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-0.5">Tổng quan hôm nay</p>
      </div>

      {/* 2 key stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/orders" search={{ status: "pending" }}
          className="bg-stone-900 border border-amber-500/25 rounded-2xl p-4 hover:border-amber-500/50 transition-colors group">
          <p className="text-xs text-stone-500 mb-2">Chờ xác nhận</p>
          {isLoading
            ? <div className="h-8 w-12 bg-stone-800 rounded-lg animate-pulse" />
            : <p className="text-3xl font-bold text-amber-400">{data?.pending ?? 0}</p>
          }
          <p className="text-[11px] text-stone-600 mt-1.5 flex items-center gap-1 group-hover:text-amber-500/60 transition-colors">
            Xem ngay <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-4">
          <p className="text-xs text-stone-500 mb-2">Hôm nay</p>
          {isLoading
            ? <div className="h-8 w-16 bg-stone-800 rounded-lg animate-pulse" />
            : <p className="text-3xl font-bold text-white">{data?.todayCount ?? 0} <span className="text-base font-normal text-stone-500">đơn</span></p>
          }
          <p className="text-[11px] text-stone-500 mt-1.5">
            {isLoading ? "—" : formatPrice(data?.todayRevenue ?? 0)}
          </p>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Doanh thu</p>
        <div className="grid grid-cols-3 divide-x divide-stone-800">
          {[
            { label: "Hôm nay", value: data?.todayRevenue },
            { label: "Tháng này", value: data?.monthRevenue },
            { label: "Tất cả", value: data?.allRevenue },
          ].map((r) => (
            <div key={r.label} className="px-4 first:pl-0 last:pr-0">
              <p className="text-[11px] text-stone-500 mb-1">{r.label}</p>
              {isLoading
                ? <div className="h-5 w-20 bg-stone-800 rounded animate-pulse" />
                : <p className="text-sm font-bold text-white">{formatPrice(r.value ?? 0)}</p>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders — full width, more rows */}
      <div className="bg-stone-900 border border-stone-800/80 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/60">
          <h2 className="text-sm font-semibold text-white">Đơn hàng mới nhất</h2>
          <Link to="/orders" search={{ status: "" }}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium">
            Tất cả ({data?.totalOrders ?? 0}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-stone-800/60">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-stone-800 rounded" />
                  <div className="h-3 w-44 bg-stone-800 rounded" />
                </div>
                <div className="h-4 w-20 bg-stone-800 rounded" />
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
              <Link key={order.id} to="/orders/$id" params={{ id: order.id }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm text-white font-mono font-semibold group-hover:text-rose-400 transition-colors">
                      {order.order_code || order.id.slice(-8).toUpperCase()}
                    </p>
                    {order.status === "pending" && (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-500 truncate">
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
    </div>
  );
}
