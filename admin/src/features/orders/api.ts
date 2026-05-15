import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pb";
import type { Order } from "@/schema/pocketbase";

interface OrderFilters {
  page: number;
  status: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const parts: string[] = [];
      if (filters.status) parts.push(`status="${filters.status}"`);
      if (filters.search) {
        const s = filters.search.replace(/"/g, '\\"');
        parts.push(`(customer_name~"${s}"||customer_phone~"${s}"||order_code~"${s}")`);
      }
      if (filters.dateFrom) parts.push(`created>="${filters.dateFrom} 00:00:00"`);
      if (filters.dateTo) parts.push(`created<="${filters.dateTo} 23:59:59"`);

      return pb.collection("orders").getList<Order>(filters.page, 10, {
        sort: "-created",
        filter: parts.join(" && ") || undefined,
      });
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => pb.collection("orders").getOne<Order>(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      pb.collection("orders").update<Order>(id, { status }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.setQueryData(["orders", updated.id], updated);
    },
  });
}
