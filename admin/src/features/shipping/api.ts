import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pb";
import type { ShippingZone } from "@/schema/pocketbase";

export function useShippingZones() {
  return useQuery({
    queryKey: ["shipping_zones"],
    queryFn: () =>
      pb.collection("shipping_zones").getFullList<ShippingZone>({ sort: "sort_order" }),
    staleTime: 60_000,
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ShippingZone, "id">) =>
      pb.collection("shipping_zones").create<ShippingZone>(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipping_zones"] }),
  });
}

export function useUpdateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<ShippingZone> & { id: string }) =>
      pb.collection("shipping_zones").update<ShippingZone>(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipping_zones"] }),
  });
}

export function useDeleteZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pb.collection("shipping_zones").delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipping_zones"] }),
  });
}
