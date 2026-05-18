import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pb";
import type { Settings } from "@/schema/pocketbase";
import { SHOP_URL } from "@/lib/config";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => pb.collection("settings").getFullList<Settings>(),
    staleTime: 60_000,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      pb.collection("settings").update<Settings>(id, { value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      fetch(`${SHOP_URL}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/" }),
      }).catch(() => {});
    },
  });
}
