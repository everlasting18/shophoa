import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pb";
import type { Order } from "@/schema/pocketbase";

export function useOrdersRealtime(onNew?: (order: Order) => void) {
  const qc = useQueryClient();
  const onNewRef = useRef(onNew);
  useEffect(() => { onNewRef.current = onNew; });

  useEffect(() => {
    let unsub: (() => void) | undefined;

    pb.collection("orders")
      .subscribe<Order>("*", (e) => {
        qc.invalidateQueries({ queryKey: ["orders"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        if (e.action === "create" && onNewRef.current) {
          onNewRef.current(e.record);
        }
      })
      .then((fn) => { unsub = fn; })
      .catch((err) => { console.error("[realtime] orders subscribe failed:", err); });

    return () => { unsub?.(); };
  }, [qc]);
}
