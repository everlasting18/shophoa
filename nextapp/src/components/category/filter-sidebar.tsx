"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import type { Category } from "@/schema";

const PRICE_RANGES = [
  { label: "Tất cả mức giá", min: "", max: "" },
  { label: "Dưới 300.000đ", min: "0", max: "300000" },
  { label: "300.000 – 500.000đ", min: "300000", max: "500000" },
  { label: "500.000 – 1.000.000đ", min: "500000", max: "1000000" },
  { label: "Trên 1.000.000đ", min: "1000000", max: "" },
];

interface Props {
  categories: Category[];
  selectedCategories: string[];
  currentMin: string;
  currentMax: string;
  currentSort: string;
}

export default function FilterSidebar({
  categories,
  selectedCategories,
  currentMin,
  currentMax,
  currentSort,
}: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initPriceIdx = PRICE_RANGES.findIndex(
    (p) => p.min === currentMin && p.max === currentMax
  );
  const [cats, setCats] = useState<string[]>(selectedCategories);
  const [priceIdx, setPriceIdx] = useState(initPriceIdx > 0 ? initPriceIdx : 0);

  const activeCount = cats.length + (priceIdx > 0 ? 1 : 0);

  function navigate(newCats: string[], newPriceIdx: number) {
    const range = PRICE_RANGES[newPriceIdx];
    const params = new URLSearchParams();
    if (newCats.length > 0) params.set("categories", newCats.join(","));
    if (range.min) params.set("min", range.min);
    if (range.max) params.set("max", range.max);
    if (currentSort !== "newest") params.set("sort", currentSort);
    params.set("page", "1");
    router.push(`/san-pham?${params.toString()}`);
  }

  function toggleCategory(slug: string) {
    const next = cats.includes(slug)
      ? cats.filter((c) => c !== slug)
      : [...cats, slug];
    setCats(next);
    navigate(next, priceIdx);
  }

  function selectPrice(idx: number) {
    setPriceIdx(idx);
    navigate(cats, idx);
  }

  function clearAll() {
    setCats([]);
    setPriceIdx(0);
    const params = new URLSearchParams();
    if (currentSort !== "newest") params.set("sort", currentSort);
    router.push(`/san-pham${params.size ? `?${params}` : ""}`);
  }

  const parentCats = categories.filter((c) => !c.parent);
  const childMap = categories.reduce<Record<string, Category[]>>((acc, c) => {
    if (c.parent) {
      if (!acc[c.parent]) acc[c.parent] = [];
      acc[c.parent].push(c);
    }
    return acc;
  }, {});

  function CatCheckbox({ cat, indent }: { cat: Category; indent?: boolean }) {
    const checked = cats.includes(cat.slug);
    return (
      <label
        className={`flex items-center gap-3 rounded-lg cursor-pointer transition-colors ${
          indent ? "px-2 py-1" : "px-2 py-1.5"
        } ${checked ? "bg-primary/8 text-primary" : "hover:bg-accent text-foreground/75 hover:text-foreground"}`}
      >
        <span
          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
            checked ? "bg-primary border-primary" : "border-border"
          }`}
        >
          {checked && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggleCategory(cat.slug)}
          className="sr-only"
        />
        <span className={`leading-tight ${indent ? "text-xs" : "text-sm"}`}>{cat.name}</span>
      </label>
    );
  }

  /* ── shared filter content ── */
  const filterContent = (
    <div className="space-y-7">
      {/* Chủ đề */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Chủ đề
          </span>
          {cats.length > 0 && (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              {cats.length}
            </span>
          )}
        </div>
        <div className="space-y-0.5">
          {parentCats.map((parent) => {
            const children = childMap[parent.id] ?? [];
            return (
              <div key={parent.id}>
                <CatCheckbox cat={parent} />
                {children.length > 0 && (
                  <div className="ml-3 pl-2.5 border-l border-border space-y-0.5 mt-0.5 mb-1">
                    {children.map((child) => (
                      <CatCheckbox key={child.id} cat={child} indent />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Mức giá */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">
          Mức giá
        </span>
        <div className="space-y-1">
          {PRICE_RANGES.map((range, i) => {
            const selected = priceIdx === i;
            return (
              <label
                key={i}
                className={`flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  selected ? "text-primary" : "hover:bg-accent text-foreground/75 hover:text-foreground"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    selected ? "border-primary" : "border-border"
                  }`}
                >
                  {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <input
                  type="radio"
                  name="price_filter"
                  checked={selected}
                  onChange={() => selectPrice(i)}
                  className="sr-only"
                />
                <span className="text-sm">{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear */}
      {activeCount > 0 && (
        <>
          <div className="h-px bg-border" />
          <button
            onClick={clearAll}
            className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 py-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Xoá bộ lọc
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* ── Mobile: trigger + drawer overlay ── */}
      <div className="lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-accent transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Bộ lọc
          {activeCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {activeCount}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative bg-white w-72 max-w-[85vw] h-full overflow-y-auto shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
                <span className="font-semibold text-sm">Bộ lọc</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-5 flex-1">{filterContent}</div>
              <div className="px-5 py-4 border-t border-border sticky bottom-0 bg-white">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Xem {/* could show count */} kết quả
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop: inline panel ── */}
      <div className="hidden lg:block">{filterContent}</div>
    </>
  );
}
