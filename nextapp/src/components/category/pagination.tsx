"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  basePath: string;
  sort?: string;
  extraParams?: Record<string, string>;
}

export default function Pagination({ totalPages, currentPage, basePath, sort, extraParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  function pageHref(page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (sort && sort !== "newest") params.set("sort", sort);
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => { if (v) params.set(k, v); });
    }
    return `${basePath}?${params}`;
  }

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-1 mt-8">
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-accent transition-colors",
          currentPage === 1 && "opacity-40 pointer-events-none"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {showPages.map((page, i) => {
        const prev = showPages[i - 1];
        return (
          <span key={page} className="flex items-center gap-1">
            {prev && page - prev > 1 && (
              <span className="text-muted-foreground px-1">…</span>
            )}
            <Link
              href={pageHref(page)}
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-colors",
                page === currentPage
                  ? "bg-primary text-white border-primary"
                  : "border-border hover:bg-accent"
              )}
            >
              {page}
            </Link>
          </span>
        );
      })}

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-accent transition-colors",
          currentPage === totalPages && "opacity-40 pointer-events-none"
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}
