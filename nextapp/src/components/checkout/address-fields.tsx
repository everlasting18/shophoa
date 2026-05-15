"use client";

import { useRef, useEffect } from "react";
import { MapPin, Truck } from "lucide-react";
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { CheckoutForm } from "@/schema";
import InputIcon from "@/components/ui/input-icon";
import { useProvinces } from "@/hooks/use-provinces";
import { DISTRICT_ZONE_MAP, SHIPPING_ZONES } from "@/config";
import { formatPrice } from "@/lib/utils";

interface Props {
  register: UseFormRegister<CheckoutForm>;
  setValue: UseFormSetValue<CheckoutForm>;
  watch: UseFormWatch<CheckoutForm>;
  isPickup: boolean;
}

export default function AddressFields({ register, setValue, watch, isPickup }: Props) {
  const { districts, wards, fetchWards, loading, error } = useProvinces();
  const district = watch("recipientDistrict");
  const lastDistrict = useRef("");

  useEffect(() => {
    if (!district || !districts.length) return;
    const d = districts.find((d) => d.name === district);
    if (!d) return;
    if (district !== lastDistrict.current) {
      setValue("recipientWard", "");
    }
    lastDistrict.current = district;
    fetchWards(d.code);
  }, [district, districts, fetchWards, setValue]);

  if (isPickup) return null;

  const mappedIdx = district ? DISTRICT_ZONE_MAP[district] : undefined;
  const mappedZone = mappedIdx !== undefined ? SHIPPING_ZONES[mappedIdx] : null;

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-destructive">
          Không tải được danh sách tỉnh/thành. Vui lòng nhập địa chỉ vào ô ghi chú.
        </p>
      )}

      <InputIcon icon={<MapPin className="w-4 h-4" />}>
        <input
          {...register("recipientStreet")}
          placeholder="Số nhà, tên đường *"
          className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
        />
      </InputIcon>

      <div className="grid grid-cols-2 gap-3">
        <InputIcon icon={<MapPin className="w-4 h-4" />}>
          <select
            {...register("recipientDistrict")}
            className="w-full bg-transparent outline-none text-sm text-foreground cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Chọn Quận / Huyện</option>
            {districts.map((d) => (
              <option key={d.code} value={d.name}>{d.name}</option>
            ))}
          </select>
        </InputIcon>

        <InputIcon icon={<MapPin className="w-4 h-4" />}>
          <select
            {...register("recipientWard")}
            className="w-full bg-transparent outline-none text-sm text-foreground cursor-pointer disabled:text-muted-foreground/40"
            defaultValue=""
            disabled={!district || loading}
          >
            <option value="">
              {loading ? "Đang tải..." : district ? "Chọn Phường / Xã" : "Chọn Quận trước"}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.name}>{w.name}</option>
            ))}
          </select>
        </InputIcon>
      </div>

      {/* Inline shipping fee */}
      {district && (
        <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm border ${
          mappedZone
            ? "bg-primary/5 border-primary/15"
            : "bg-amber-50 border-amber-100 text-amber-800"
        }`}>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Truck className="w-3.5 h-3.5" />
            Phí vận chuyển
          </span>
          {mappedZone ? (
            <span className="font-bold text-primary">
              {mappedZone.fee === 0 ? "Miễn phí" : formatPrice(mappedZone.fee)}
            </span>
          ) : (
            <span className="text-xs font-medium">Xác nhận qua Zalo</span>
          )}
        </div>
      )}
    </div>
  );
}
