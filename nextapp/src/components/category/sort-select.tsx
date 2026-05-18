"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface SortSelectProps {
  current: string;
  slug: string;
}

export default function SortSelect({ current, slug }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const options = [
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá thấp → cao" },
    { value: "price_desc", label: "Giá cao → thấp" },
  ];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.set("page", "1");
    router.push(`/${slug}?${params.toString()}`);
  }

  return (
    <div className="relative">
      <select
        name="sort"
        defaultValue={current}
        onChange={handleChange}
        className="appearance-none text-sm border border-border rounded-lg pl-3 pr-8 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
    </div>
  );
}