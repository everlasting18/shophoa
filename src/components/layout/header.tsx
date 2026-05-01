"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Search, Menu, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SITE_NAME, NAV_ITEMS, CONTACT } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import type { CartStore } from "@/stores/cart-store";
import SearchDialog from "@/components/layout/search-dialog";

export default function Header() {
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalItems = useCartStore((s: CartStore) => s.totalItems());

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        {/* Top bar */}
        <div className="bg-primary text-white text-xs py-1.5 text-center hidden sm:block">
          <span>🌸 Giao hoa hỏa tốc 60 phút tại TPHCM – Hotline: </span>
          <a href={`tel:${CONTACT.phone}`} className="font-semibold hover:underline">
            {CONTACT.phoneDisplay}
          </a>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" />
              }
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mt-6 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between py-2.5 px-3 rounded-md text-sm font-medium hover:bg-accent hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-4 border-l border-border pl-3 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="flex items-center gap-2 text-sm font-medium text-primary"
                >
                  <Phone className="w-4 h-4" />
                  {CONTACT.phoneDisplay}
                </a>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl sm:text-2xl font-heading font-bold text-primary leading-tight">
              🌸 {SITE_NAME}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" onMouseLeave={() => setOpenMegaMenu(null)}>
            {NAV_ITEMS.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => item.children ? setOpenMegaMenu(item.href) : setOpenMegaMenu(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-primary transition-colors"
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                </Link>

                {/* Dropdown */}
                {item.children && openMegaMenu === item.href && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-border rounded-xl shadow-lg py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                        onClick={() => setOpenMegaMenu(null)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tìm kiếm"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>

            <Link href="/gio-hang">
              <Button variant="ghost" size="icon" aria-label="Giỏ hàng" className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span
                  suppressHydrationWarning
                  className={`absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center leading-none transition-opacity ${totalItems === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              </Button>
            </Link>

            <a
              href={`tel:${CONTACT.phone}`}
              className="hidden sm:flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
