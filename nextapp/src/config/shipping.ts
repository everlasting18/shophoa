import type { ShippingZone } from "@/schema/pocketbase";

export const DISTRICT_ZONE_MAP: Record<string, number> = {
  "Quận 1": 0, "Quận 3": 0, "Quận 5": 0, "Quận 10": 0,
  "Quận 4": 1, "Quận Phú Nhuận": 1,
  "Quận 6": 2, "Quận 7": 2, "Quận 8": 2, "Quận 11": 2,
  "Quận Bình Thạnh": 3,
  "Quận Tân Bình": 4, "Quận Bình Tân": 4, "Quận Tân Phú": 4, "Quận Gò Vấp": 4,
  "Quận 2": 5,
  "Quận 9": 6, "Quận 12": 6, "Huyện Nhà Bè": 6, "Huyện Bình Chánh": 6, "Huyện Hóc Môn": 6, "Thành phố Thủ Đức": 6,
};

export const SHIPPING_ZONES = [
  { label: "Quận 1, Quận 3, Quận 5, Quận 10", fee: 20000 },
  { label: "Quận 4, Phú Nhuận", fee: 30000 },
  { label: "Quận 6, Quận 7, Quận 8, Quận 11", fee: 40000 },
  { label: "Bình Thạnh", fee: 40000 },
  { label: "Tân Bình | Bình Tân | Tân Phú | Gò Vấp", fee: 60000 },
  { label: "Quận 2", fee: 50000 },
  { label: "Quận 9 – Quận 12 – Nhà Bè – Bình Chánh – Hóc Môn – Thủ Đức (Theo Phí Grab)", fee: 80000 },
  { label: "Lấy tại cửa hàng", fee: 0 },
];

export const DAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

export const FALLBACK_ZONES: ShippingZone[] = SHIPPING_ZONES.map((z, i) => ({
  id: String(i),
  label: z.label,
  fee: z.fee,
  sort_order: i,
  districts: Object.entries(DISTRICT_ZONE_MAP)
    .filter(([, zoneIdx]) => zoneIdx === i)
    .map(([name]) => name),
}));

export function buildDistrictMap(zones: ShippingZone[]): Record<string, number> {
  const map: Record<string, number> = {};
  zones.forEach((zone, idx) => {
    (zone.districts ?? []).forEach((d) => { map[d] = idx; });
  });
  return map;
}
