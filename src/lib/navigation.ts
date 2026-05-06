import { cache } from "react";
import type { Category } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const FALLBACK_NAV_ITEMS: NavItem[] = [
  {
    label: "Hoa Sinh Nhật",
    href: "/hoa-sinh-nhat",
    children: [
      { label: "Bó Hoa Sinh Nhật", href: "/bo-hoa-sinh-nhat" },
      { label: "Lẵng Hoa Sinh Nhật", href: "/lang-hoa-sinh-nhat" },
      { label: "Giỏ Hoa Sinh Nhật", href: "/gio-hoa-sinh-nhat" },
      { label: "Kệ Hoa Sinh Nhật", href: "/ke-hoa-sinh-nhat" },
    ],
  },
  {
    label: "Hoa Khai Trương",
    href: "/hoa-khai-truong",
    children: [
      { label: "Kệ Hoa Khai Trương", href: "/ke-hoa-khai-truong" },
      { label: "Lẵng Hoa Khai Trương", href: "/lang-hoa-khai-truong" },
      { label: "Giỏ Hoa Khai Trương", href: "/gio-hoa-khai-truong" },
      { label: "Kệ Hoa Mini", href: "/ke-hoa-mini" },
    ],
  },
  {
    label: "Hoa Tốt Nghiệp",
    href: "/hoa-tot-nghiep",
    children: [
      { label: "Hoa Hướng Dương TN", href: "/bo-hoa-huong-duong-tot-nghiep" },
      { label: "Hoa Tốt Nghiệp Nữ", href: "/hoa-tot-nghiep-cho-nu" },
      { label: "Hoa Tốt Nghiệp Nam", href: "/hoa-tot-nghiep-cho-nam" },
    ],
  },
  {
    label: "Hoa Bó",
    href: "/bo-hoa-tuoi",
    children: [
      { label: "Best Seller", href: "/bo-hoa-tuoi" },
      { label: "Garden Mix", href: "/hoa-bo-garden-mix" },
      { label: "Hoa Tulip", href: "/bo-hoa-tulip" },
      { label: "Hoa Hướng Dương", href: "/bo-hoa-huong-duong" },
      { label: "Hoa Hồng", href: "/bo-hoa-hong" },
      { label: "Sophia Collection", href: "/hoa-hong-sophia" },
      { label: "Hoa Cao Cấp", href: "/bo-hoa-cao-cap" },
    ],
  },
  { label: "Hộp Hoa Mica", href: "/hop-hoa-mica" },
  {
    label: "Dịp Tặng",
    href: "/hoa-theo-chu-de",
    children: [
      { label: "Hoa Tình Yêu", href: "/hoa-tinh-yeu" },
      { label: "Hoa Valentine 14/2", href: "/hoa-valentine-14-02" },
      { label: "Hoa 8/3", href: "/hoa-8-thang-3" },
      { label: "Hoa 20/10", href: "/hoa-20-thang-10" },
      { label: "Hoa 20/11", href: "/hoa-20-thang-11" },
      { label: "Hoa Chia Buồn", href: "/tong-hop-hoa-chia-buon" },
      { label: "Hoa Gấu Bông", href: "/bo-hoa-gau-bong" },
    ],
  },
];

function buildTree(records: Category[]): NavItem[] {
  const childrenMap = new Map<string, Category[]>();
  const parents: Category[] = [];

  for (const cat of records) {
    if (cat.parent) {
      const list = childrenMap.get(cat.parent) ?? [];
      list.push(cat);
      childrenMap.set(cat.parent, list);
    } else {
      parents.push(cat);
    }
  }

  parents.sort((a, b) => a.sort_order - b.sort_order);

  const items: NavItem[] = [];
  for (const parent of parents) {
    const kids = childrenMap.get(parent.id);
    if (kids && kids.length > 0) {
      items.push({
        label: parent.name,
        href: `/${parent.slug}`,
        children: kids
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((k) => ({ label: k.name, href: `/${k.slug}` })),
      });
    } else {
      items.push({ label: parent.name, href: `/${parent.slug}` });
    }
  }

  return items;
}

export const getNavItems = cache(async (): Promise<NavItem[]> => {
  try {
    const { default: pb } = await import("./pocketbase");
    const records = await pb.collection("categories").getFullList<Category>({
      sort: "sort_order",
      filter: "is_active=true",
    });

    if (records.length === 0) return FALLBACK_NAV_ITEMS;
    const tree = buildTree(records);
    if (tree.length === 0) return FALLBACK_NAV_ITEMS;
    return tree;
  } catch (e) {
    console.error("getNavItems failed:", e);
    return FALLBACK_NAV_ITEMS;
  }
});
