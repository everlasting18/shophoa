import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pb";
import type { Banner } from "@/schema/pocketbase";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => pb.collection("banners").getFullList<Banner>({ sort: "sort_order" }),
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { image: File; link: string; sort_order: number }) =>
      pb.collection("banners").create<Banner>(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useToggleBannerActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      pb.collection("banners").update<Banner>(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pb.collection("banners").delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useReorderBanners() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; sort_order: number }[]) =>
      Promise.all(updates.map(({ id, sort_order }) => pb.collection("banners").update(id, { sort_order }))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}
