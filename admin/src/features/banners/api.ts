import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pb";
import { SHOP_URL } from "@/lib/config";
import type { Banner } from "@/schema/pocketbase";

function revalidate() {
  fetch(`${SHOP_URL}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: "/" }),
  }).catch(() => {});
}

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
      pb.collection("banners").create<Banner>({ ...data, is_active: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["banners"] }); revalidate(); },
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, link }: { id: string; link: string }) =>
      pb.collection("banners").update<Banner>(id, { link }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["banners"] }); revalidate(); },
  });
}

export function useToggleBannerActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      pb.collection("banners").update<Banner>(id, { is_active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["banners"] }); revalidate(); },
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pb.collection("banners").delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["banners"] }); revalidate(); },
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
