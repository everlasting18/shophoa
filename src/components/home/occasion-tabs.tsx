"use client";

import Link from "next/link";
const OCCASIONS = [
  { label: "Sinh Nhật", href: "/hoa-sinh-nhat", emoji: "🎂" },
  { label: "Tốt Nghiệp", href: "/hoa-tot-nghiep", emoji: "🎓" },
  { label: "Khai Trương", href: "/hoa-khai-truong", emoji: "🏮" },
  { label: "Tình Yêu", href: "/hoa-tinh-yeu", emoji: "💕" },
  { label: "Chia Buồn", href: "/tong-hop-hoa-chia-buon", emoji: "🤍" },
  { label: "Sự Kiện", href: "/hoa-su-kien", emoji: "🎊" },
  { label: "Chúc Mừng", href: "/ke-hoa-khai-truong", emoji: "🥂" },
  { label: "Giá Rẻ", href: "/hoa-gia-re", emoji: "💝" },
];

export default function OccasionTabs() {
  return (
    <section className="py-6 bg-white border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
          {OCCASIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 snap-start flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-accent transition-colors group"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-xs font-medium whitespace-nowrap text-muted-foreground group-hover:text-primary transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
