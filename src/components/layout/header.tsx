"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { SITE_NAME } from "@/config";
import { useCartStore } from "@/stores/cart-store";
import SearchDialog from "@/components/layout/search-dialog";

const NAV = [
  { label: "SHOP", href: "/bo-hoa-tuoi" },
  { label: "ABOUT", href: "/gioi-thieu" },
  { label: "CONTACT", href: "/lien-he" },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const total = useCartStore((s) => s.totalItems());

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center">
          {/* Search left */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Search"
          >
            <Search className="w-[17px] h-[17px]" />
          </button>

          {/* Logo center */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <span className="font-heading text-xl tracking-[0.25em] text-foreground font-medium">
                {SITE_NAME}
              </span>
            </Link>
          </div>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-8 mr-4">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[11px] tracking-[0.2em] text-muted-foreground hover:text-foreground font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-foreground hover:after:w-full after:transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Cart + mobile */}
          <div className="flex items-center gap-1">
            <Link
              href="/gio-hang"
              className="relative w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-[17px] h-[17px]" />
              {total > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center">
                  {total > 99 ? "99+" : total}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-[17px] h-[17px]" />
            </button>
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
