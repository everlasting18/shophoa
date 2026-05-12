"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingCart, Search, Menu, Phone, ChevronDown, ChevronRight, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SITE_NAME, NAV_ITEMS } from "@/config";
import type { NavItem } from "@/schema";
import { useCartStore } from "@/stores/cart-store";
import SearchDialog from "@/components/layout/search-dialog";

const NAV = [
  { label: "SHOP", href: "/bo-hoa-tuoi" },
  { label: "ABOUT", href: "/gioi-thieu" },
  { label: "CONTACT", href: "/lien-he" },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState<Record<string, boolean>>({});
  const [navItems, setNavItems] = useState<NavItem[]>(NAV_ITEMS);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s: CartStore) => s.totalItems());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/navigation")
      .then((r) => r.json())
      .then((data: NavItem[]) => { if (data.length > 0) setNavItems(data); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    setMounted(true);
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
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled
          ? "bg-[#fcfdeb]/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(61,79,51,0.08)] border-b border-[#c9d4b8]/60"
          : "bg-[#fcfdeb] border-b border-transparent"
          }`}
      >
        {/* Main bar */}
        <div className="container mx-auto px-4 h-14 lg:h-[72px] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group h-full">
            <div className="relative h-14 w-auto min-w-[100px] lg:h-[72px] transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src="/images/LO1.png"
                alt={SITE_NAME}
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-8 mr-4">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[11px] tracking-[0.2em] text-muted-foreground hover:text-foreground font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-foreground hover:after:w-full after:transition-all"
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors ${openMegaMenu === item.href
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
                    className="absolute top-full left-0 mt-1 bg-white border border-border/60 rounded-xl shadow-xl shadow-black/[0.04] py-2 px-1 z-50 animate-in fade-in zoom-in-95 duration-200 min-w-[200px]"
                    onMouseEnter={() => handleMenuEnter(item.href)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="flex flex-col gap-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground/80 hover:text-primary hover:bg-accent/40 rounded-lg transition-all group/link"
                          onClick={() => setOpenMegaMenu(null)}
                        >
                          <span className="w-1 h-1 rounded-full bg-primary/20 group-hover/link:bg-primary group-hover/link:scale-125 transition-all shrink-0" />
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
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tìm kiếm"
              onClick={() => setSearchOpen(true)}
              className="hover:bg-accent rounded-lg w-9 h-9"
            >
              <Search className="w-4.5 h-4.5" />
            </Button>

            <Link href="/gio-hang" className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors" aria-label="Giỏ hàng">
              <ShoppingCart className="w-4.5 h-4.5" />
              {mounted && totalItems > 0 && (
                <span suppressHydrationWarning className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none shadow-sm shadow-primary/20 pointer-events-none">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Menu"
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
                <Link href="/" className="block" onClick={() => setMobileOpen({})}>
                  <img
                    src="/images/logo.jpg"
                    alt={SITE_NAME}
                    className="h-14 w-auto object-contain"
                  />
                </Link>
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

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/10 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-background z-50 lg:hidden shadow-xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <span className="font-heading tracking-[0.2em] font-medium">{SITE_NAME}</span>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="px-5 py-6 flex flex-col gap-5">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-[0.15em] text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
