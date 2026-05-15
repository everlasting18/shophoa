import { cache } from "react";
import type { Category, NavItem } from "@/schema";
import { NAV_ITEMS } from "@/config";

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

    if (records.length === 0) return NAV_ITEMS;
    const tree = buildTree(records);
    if (tree.length === 0) return NAV_ITEMS;
    return tree;
  } catch (e) {
    console.error("getNavItems failed:", e);
    return NAV_ITEMS;
  }
});
