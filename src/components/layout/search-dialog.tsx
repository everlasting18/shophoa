"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_SEARCHES = [
  "Hoa sinh nhật",
  "Hoa tulip",
  "Hoa hồng",
  "Hộp hoa mica",
  "Hoa khai trương",
];

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setTimeout(() => setQuery(""), 200);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    onOpenChange(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
  }

  function handleQuickSearch(term: string) {
    onOpenChange(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(term)}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-xl top-[18%] translate-y-0 p-0 overflow-hidden border border-border/80 shadow-2xl">
        <DialogTitle className="sr-only">Tìm kiếm</DialogTitle>
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm hoa sinh nhật, tulip, hoa hồng..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={!query.trim()}
            className="text-sm font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground/40 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        <div className="px-5 py-4 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Tìm kiếm phổ biến
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                className="px-3 py-1.5 rounded-full bg-white border border-border/60 text-xs text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
