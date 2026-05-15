import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pb";
import { SHOP_URL } from "@/lib/config";
import type { Product } from "@/schema/pocketbase";

function revalidate(...paths: string[]) {
  paths.forEach((path) =>
    fetch(`${SHOP_URL}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => {})
  );
}

export function useProducts(page: number, search: string, activeFilter: "all" | "active" | "inactive" = "all") {
  return useQuery({
    queryKey: ["products", page, search, activeFilter],
    queryFn: () => {
      const parts: string[] = [];
      if (search) parts.push(`name~"${search.replace(/"/g, '\\"')}"`);
      if (activeFilter === "active") parts.push("is_active=true");
      if (activeFilter === "inactive") parts.push("is_active=false");
      return pb.collection("products").getList<Product>(page, 10, {
        sort: "-created",
        filter: parts.join(" && ") || undefined,
      });
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => pb.collection("products").getOne<Product>(id),
    enabled: id !== "new",
  });
}

export function useToggleProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      pb.collection("products").update<Product>(id, { is_active }),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      revalidate(`/san-pham/${product.slug}`, "/san-pham", "/");
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pb.collection("products").delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      revalidate("/san-pham", "/");
    },
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | "new"; data: FormData }) =>
      id === "new"
        ? pb.collection("products").create<Product>(data)
        : pb.collection("products").update<Product>(id, data),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      revalidate(`/san-pham/${product.slug}`, "/san-pham", "/");
    },
  });
}
