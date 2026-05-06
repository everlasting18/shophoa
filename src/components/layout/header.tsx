"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingCart, Search, Menu, Phone, ChevronDown, ChevronRight, Flower2, Clock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SITE_NAME, NAV_ITEMS } from "@/lib/constants";
import type { NavItem } from "@/lib/navigation";
import { useCartStore } from "@/stores/cart-store";
import type { CartStore } from "@/stores/cart-store";
import SearchDialog from "@/components/layout/search-dialog";
import { useSettings } from "@/hooks/use-settings";

export default function Header() {
  const contact = useSettings();
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState<Record<string, boolean>>({});
  const [navItems, setNavItems] = useState<NavItem[]>(NAV_ITEMS);
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s: CartStore) => s.totalItems());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/navigation")
      .then((r) => r.json())
      .then((data: NavItem[]) => { if (data.length > 0) setNavItems(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMobileToggle = useCallback((href: string) => {
    setMobileOpen((prev) => ({ ...prev, [href]: !prev[href] }));
  }, []);

  function handleMenuEnter(href: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (navItems.find((n) => n.href === href)?.children) {
      setOpenMegaMenu(href);
    }
  }

  function handleMenuLeave() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMegaMenu(null), 150);
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-b border-border/40"
            : "bg-white border-b border-transparent"
        }`}
      >
        {/* Top bar */}
        <div className={`hidden sm:block bg-primary text-white/90 text-[11px] transition-all duration-300 overflow-hidden ${scrolled ? "h-0 opacity-0" : "h-7 opacity-100"}`}>
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3 h-3" />
              Giao hoa hỏa tốc 60 phút nội thành TPHCM
            </span>
            <span className="inline-flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                08:00 – 21:00
              </span>
              <a href={`tel:${contact.phone}`} className="hover:text-white font-medium">
                {contact.phoneDisplay}
              </a>
            </span>
          </div>
        </div>

        {/* Main bar */}
        <div className="container mx-auto px-4 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Flower2 className="w-5 h-5 text-primary transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <span className="text-lg font-heading font-bold text-foreground tracking-tight hidden sm:block">
              {SITE_NAME}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => handleMenuEnter(item.href)}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                    openMegaMenu === item.href
                      ? "bg-accent text-primary"
                      : "text-foreground/80 hover:text-primary hover:bg-accent/50"
                  }`}
                >
                  {item.label}
                  {item.children && item.children.length > 0 && (
                    <ChevronDown className={`w-3 h-3 opacity-40 transition-transform duration-200 ${openMegaMenu === item.href ? "rotate-180 opacity-100" : ""}`} />
                  )}
                </Link>

                {item.children && item.children.length > 0 && openMegaMenu === item.href && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-border/60 rounded-2xl shadow-xl shadow-black/[0.04] py-3 px-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                    style={{ minWidth: Math.min(item.children.length * 180 + 32, 560) }}
                    onMouseEnter={() => handleMenuEnter(item.href)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.min(Math.ceil(item.children.length / 4), 3)}, 1fr)` }}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-accent/50 rounded-xl transition-all group/link"
                          onClick={() => setOpenMegaMenu(null)}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover/link:bg-primary group-hover/link:scale-125 transition-all shrink-0" />
                          <span className="whitespace-nowrap">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tìm kiếm"
              onClick={() => setSearchOpen(true)}
              className="hover:bg-accent rounded-xl"
            >
              <Search className="w-[18px] h-[18px]" />
            </Button>

            <Link href="/gio-hang" className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-accent transition-colors" aria-label="Giỏ hàng">
              <ShoppingCart className="w-[18px] h-[18px]" />
              {totalItems > 0 && (
                <span suppressHydrationWarning className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none shadow-sm shadow-primary/20 pointer-events-none">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            <a
              href={`tel:${contact.phone}`}
              className="hidden sm:flex items-center gap-1.5 ml-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/15"
            >
              <Phone className="w-3 h-3" />
              {contact.phoneDisplay}
            </a>

            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden rounded-xl" />}>
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Flower2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">{SITE_NAME}</p>
                    <p className="text-[10px] text-muted-foreground">Shop hoa tươi TPHCM</p>
                  </div>
                </div>
                <div className="p-3 space-y-0.5">
                  {navItems.map((item) => (
                    <div key={item.href}>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-accent hover:text-primary transition-colors"
                        >
                          {item.label}
                        </Link>
                        {item.children && item.children.length > 0 && (
                          <button
                            onClick={(e) => { e.preventDefault(); handleMobileToggle(item.href); }}
                            className="px-3 py-2.5 text-muted-foreground hover:text-primary transition-colors"
                            aria-label={`Mở ${item.label}`}
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${mobileOpen[item.href] ? "rotate-90" : ""}`} />
                          </button>
                        )}
                      </div>
                      {item.children && mobileOpen[item.href] && (
                        <div className="ml-4 border-l-2 border-primary/10 pl-3 space-y-0.5 mb-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block py-2.5 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-lg transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/60 p-4 bg-accent/30">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {contact.phoneDisplay}
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
