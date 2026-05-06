"use client";

import { useRouter } from "next/navigation";

interface SortSelectProps {
  current: string;
  slug: string;
}

export default function SortSelect({ current, slug }: SortSelectProps) {
  const router = useRouter();
  const options = [
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá thấp → cao" },
    { value: "price_desc", label: "Giá cao → thấp" },
  ];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`/${slug}?sort=${e.target.value}&page=1`);
  }

  return (
    <select
      name="sort"
      defaultValue={current}
      onChange={handleChange}
      className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}