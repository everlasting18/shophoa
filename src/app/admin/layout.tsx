"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminStore } from "@/stores/admin-store";
import pb from "@/services/pocketbase";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderOpen,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: FolderOpen },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, adminEmail, logout } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    if (!mounted) return;
    if (!isLoggedIn && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [mounted, isLoggedIn, pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (!mounted || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function handleLogout() {
    pb.authStore.clear();
    logout();
    router.push("/admin/login");
    fetch("/api/auth/admin/logout", { method: "POST" }).catch(console.error);
  }

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-zinc-900 border-r border-zinc-800 z-30 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:flex`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Admin</p>
              <p className="text-[10px] text-zinc-500">Vườn Hoa Tươi</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-rose-600/20 text-rose-400 font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-zinc-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-[10px] text-zinc-500 truncate">{adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-white">
            {NAV.find((n) => isActive(n))?.label ?? "Admin"}
          </span>
        </header>

        <main className="flex-1 p-5 lg:p-7 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
