import { cache } from "react";
import type { ShippingZone } from "@/schema/pocketbase";
import { FALLBACK_ZONES } from "@/config/shipping";

export const getShippingZones = cache(async (): Promise<ShippingZone[]> => {
  try {
    const { default: pb } = await import("./pocketbase");
    const zones = await pb.collection("shipping_zones").getFullList<ShippingZone>({
      sort: "sort_order",
    });
    if (zones.length === 0) return FALLBACK_ZONES;
    // Đảm bảo luôn có pickup zone (fee=0), nếu admin chưa tạo thì lấy từ fallback
    const hasPickup = zones.some((z) => z.fee === 0);
    if (!hasPickup) {
      const fallbackPickup = FALLBACK_ZONES.find((z) => z.fee === 0);
      if (fallbackPickup) return [...zones, fallbackPickup];
    }
    return zones;
  } catch {
    return FALLBACK_ZONES;
  }
});
