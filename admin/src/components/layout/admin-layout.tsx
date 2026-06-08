import { Link, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingBag, Package,
  FolderOpen, Image, Settings, LogOut, LayoutGrid, X, ChevronLeft,
  QrCode, ScanLine,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { useOrdersRealtime } from "@/features/orders/realtime";
import { useToast } from "@/lib/toast";
import pb from "@/lib/pb";

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: boolean;
  ownerOnly?: boolean;
};

const SIDEBAR_NAV: NavItem[] = [
  { to: "/",           label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { to: "/orders",     label: "Đơn hàng",   icon: ShoppingBag, badge: true },
  { to: "/products",   label: "Sản phẩm",   icon: Package },
  { to: "/checkin-vouchers", label: "Voucher Check-in", icon: QrCode },
  { to: "/qr-scanner",       label: "Quét QR",          icon: ScanLine },
  { to: "/categories", label: "Danh mục",   icon: FolderOpen, ownerOnly: true },
  { to: "/banners",    label: "Banners",     icon: Image,      ownerOnly: true },
  { to: "/settings",   label: "Cài đặt",    icon: Settings,   ownerOnly: true },
];

const BOTTOM_TABS: NavItem[] = [
  { to: "/",         label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/orders",   label: "Đơn hàng",  icon: ShoppingBag, badge: true },
  { to: "/products", label: "Sản phẩm",  icon: Package },
];

const MORE_ITEMS: NavItem[] = [
  { to: "/checkin-vouchers", label: "Voucher Check-in", icon: QrCode },
  { to: "/qr-scanner",       label: "Quét QR",          icon: ScanLine },
  { to: "/categories", label: "Danh mục", icon: FolderOpen, ownerOnly: true },
  { to: "/banners",    label: "Banners",  icon: Image,      ownerOnly: true },
  { to: "/settings",   label: "Cài đặt", icon: Settings,   ownerOnly: true },
];

function usePendingCount() {
  return useQuery({
    queryKey: ["orders", "pending-count"],
    queryFn: () =>
      pb.collection("orders")
        .getList(1, 1, { filter: 'status="pending"' })
        .then((r) => r.totalItems),
    staleTime: 30_000,
  });
}

const NAV_BASE = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:text-white hover:bg-white/[0.06] transition-all duration-150";
const NAV_ACTIVE = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-rose-500/15 text-rose-300";

const MOBILE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Đơn hàng",
  "/products": "Sản phẩm",
  "/categories": "Danh mục",
  "/banners": "Banners",
  "/settings": "Cài đặt",
  "/checkin-vouchers": "Voucher Check-in",
  "/qr-scanner": "Quét QR",
};

function getMobileTitle(path: string) {
  if (MOBILE_TITLES[path]) return MOBILE_TITLES[path];
  if (path.startsWith("/orders/")) return "Chi tiết đơn";
  if (path === "/products/new") return "Thêm sản phẩm";
  if (path.startsWith("/products/")) return "Sửa sản phẩm";
  return "Admin";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { adminEmail, role, logout } = useAuthStore();
  const isOwner = role === "owner";
  const router = useRouter();
  const { addToast } = useToast();
  const { data: pendingCount } = usePendingCount();
  const pathname = router.state.location.pathname;
  const isNested = /^\/(orders|products)\/.+/.test(pathname);

  useOrdersRealtime((order) => {
    addToast(`Đơn mới: ${order.customer_name} · ${order.customer_phone}`, "success");
  });

  function handleLogout() {
    pb.authStore.clear();
    logout();
    router.navigate({ to: "/login" });
  }

  const initial = adminEmail?.[0]?.toUpperCase() ?? "A";

  return (
    <div className="flex h-dvh bg-stone-950 overflow-hidden">

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-stone-900 border-r border-stone-800/60">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-stone-800/60 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/20 text-lg select-none shrink-0">
            🌸
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white leading-tight tracking-tight">Tiệm hoa nhà tình</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {SIDEBAR_NAV.filter((item) => !item.ownerOnly || isOwner).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className={NAV_BASE}
              activeProps={{ className: NAV_ACTIVE }}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && pendingCount ? (
                <span className="bg-rose-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center leading-none shrink-0">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="shrink-0 px-2.5 py-3 border-t border-stone-800/60 space-y-0.5">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 text-xs font-bold text-stone-300">
              {initial}
            </div>
            <p className="text-[11px] text-stone-400 truncate flex-1">{adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center h-14 px-4 bg-stone-900 border-b border-stone-800/60 shrink-0 gap-2">
          {isNested ? (
            <button
              onClick={() => router.history.back()}
              className="w-9 h-9 -ml-1.5 flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.06] transition-all shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-rose-700 flex items-center justify-center text-base select-none shrink-0">
              🌸
            </div>
          )}
          <p className="text-sm font-bold text-white flex-1 truncate">
            {isNested ? getMobileTitle(pathname) : "Tiệm hoa nhà tình"}
          </p>
          <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[11px] font-bold text-stone-300 shrink-0 select-none">
            {initial}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-7 pb-24 lg:pb-7">
          {children}
        </main>

        {/* ─── Mobile bottom nav ─── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-stone-900/95 backdrop-blur-md border-t border-stone-800/60">
          <div className="flex h-16">
            {BOTTOM_TABS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="flex-1 flex flex-col items-center justify-center gap-1 text-stone-500 transition-colors"
                activeProps={{ className: "flex-1 flex flex-col items-center justify-center gap-1 text-rose-400" }}
              >
                <div className="relative">
                  <item.icon className="w-[22px] h-[22px]" />
                  {item.badge && pendingCount ? (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold h-3.5 min-w-[14px] px-1 rounded-full flex items-center justify-center leading-none">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            ))}

            {/* More tab — mọi role (staff: Voucher + Quét QR; owner: thêm Danh mục/Banner/Cài đặt) */}
            <button
              onClick={() => setMoreOpen(true)}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-stone-300 transition-colors"
            >
              <LayoutGrid className="w-[22px] h-[22px]" />
              <span className="text-[10px] font-medium leading-none">Thêm</span>
            </button>
          </div>
        </nav>

        {/* ─── More bottom sheet ─── */}
        {moreOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setMoreOpen(false)}
            />
            <div className="lg:hidden fixed bottom-16 inset-x-0 z-50 bg-stone-900 border-t border-stone-800/60 rounded-t-2xl shadow-2xl shadow-black/60">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-8 h-1 rounded-full bg-stone-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800/60">
                <p className="text-sm font-semibold text-white">Menu</p>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items grid */}
              <div className="p-4 grid grid-cols-2 gap-3">
                {MORE_ITEMS.filter((item) => !item.ownerOnly || isOwner).map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors active:scale-95"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => { setMoreOpen(false); handleLogout(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm text-red-400 bg-red-500/10 hover:bg-red-500/15 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>

              {/* User info */}
              <div className="flex items-center gap-2.5 px-5 py-3 border-t border-stone-800/60">
                <div className="w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] font-bold text-stone-400 shrink-0">
                  {initial}
                </div>
                <p className="text-xs text-stone-500 truncate">{adminEmail}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
