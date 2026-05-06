"use client";

import Link from "next/link";
import { Cake, GraduationCap, Store, Heart, Frown, PartyPopper, Wine, Gem } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Occasion {
  label: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  hoverText: string;
}

const OCCASIONS: Occasion[] = [
  {
    label: "Sinh Nhật",
    href: "/hoa-sinh-nhat",
    icon: Cake,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    hoverBorder: "hover:border-rose-200",
    hoverText: "group-hover:text-rose-600",
  },
  {
    label: "Tốt Nghiệp",
    href: "/hoa-tot-nghiep",
    icon: GraduationCap,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    hoverBorder: "hover:border-amber-200",
    hoverText: "group-hover:text-amber-600",
  },
  {
    label: "Khai Trương",
    href: "/hoa-khai-truong",
    icon: Store,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    hoverBorder: "hover:border-emerald-200",
    hoverText: "group-hover:text-emerald-600",
  },
  {
    label: "Tình Yêu",
    href: "/hoa-tinh-yeu",
    icon: Heart,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    hoverBorder: "hover:border-red-200",
    hoverText: "group-hover:text-red-600",
  },
  {
    label: "Chia Buồn",
    href: "/tong-hop-hoa-chia-buon",
    icon: Frown,
    iconBg: "bg-slate-50",
    iconColor: "text-slate-500",
    hoverBorder: "hover:border-slate-200",
    hoverText: "group-hover:text-slate-600",
  },
  {
    label: "Sự Kiện",
    href: "/hoa-su-kien",
    icon: PartyPopper,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    hoverBorder: "hover:border-violet-200",
    hoverText: "group-hover:text-violet-600",
  },
  {
    label: "Chúc Mừng",
    href: "/ke-hoa-khai-truong",
    icon: Wine,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    hoverBorder: "hover:border-orange-200",
    hoverText: "group-hover:text-orange-600",
  },
  {
    label: "Giá Rẻ",
    href: "/hoa-gia-re",
    icon: Gem,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
    hoverBorder: "hover:border-teal-200",
    hoverText: "group-hover:text-teal-600",
  },
];

export default function OccasionTabs() {
  return (
    <section className="py-4 bg-white border-b border-border/60">
      <div className="container mx-auto px-4">
        {/* py-2 + -my-2: tạo chỗ cho hover lift mà không bị clip bởi overflow-x-auto */}
        <div className="flex gap-2.5 overflow-x-auto py-2 -my-2 px-0.5 -mx-0.5 scrollbar-hide snap-x snap-mandatory">
          {OCCASIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 snap-start flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border border-border/60 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group ${item.hoverBorder}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${item.iconBg}`}>
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <span className={`text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors ${item.hoverText}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
