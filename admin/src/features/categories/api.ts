import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pb";
import { SHOP_URL } from "@/lib/config";
import type { Category } from "@/schema/pocketbase";

function revalidate(...paths: string[]) {
  paths.forEach((path) =>
    fetch(`${SHOP_URL}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => {})
  );
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => pb.collection("categories").getFullList<Category>({ sort: "sort_order,name" }),
    staleTime: 60_000,
  });
}

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: FormData }) =>
      id
        ? pb.collection("categories").update<Category>(id, data)
        : pb.collection("categories").create<Category>(data),
    onSuccess: (category) => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      revalidate(`/${category.slug}`, "/");
    },
  });
}

export function useToggleCategoryActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      pb.collection("categories").update<Category>(id, { is_active }),
    onSuccess: (category) => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      revalidate(`/${category.slug}`, "/");
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pb.collection("categories").delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      revalidate("/");
    },
  });
}

export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; sort_order: number; parent?: string }[]) =>
      Promise.all(updates.map(({ id, ...data }) => pb.collection("categories").update(id, data))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
