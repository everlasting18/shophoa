"use client";

import { useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { CheckoutForm } from "@/lib/checkout-schema";
import InputIcon from "@/components/ui/input-icon";
import { useProvinces } from "@/hooks/use-provinces";

interface Props {
  register: UseFormRegister<CheckoutForm>;
  setValue: UseFormSetValue<CheckoutForm>;
  watch: UseFormWatch<CheckoutForm>;
  isPickup: boolean;
}

export default function AddressFields({ register, setValue, watch, isPickup }: Props) {
  const { districts, wards, fetchWards, loading } = useProvinces();

  const district = watch("recipientDistrict");
  const lastDistrict = useRef("");

  useEffect(() => {
    if (!district || district === lastDistrict.current) return;
    lastDistrict.current = district;

    const d = districts.find((d) => d.name === district);
    if (d) {
      setValue("recipientWard", "");
      fetchWards(d.code);
    }
  }, [district, districts, fetchWards, setValue]);

  if (isPickup) return null;

  return (
    <div className="space-y-3">
      <div>
        <InputIcon icon={<MapPin className="w-4 h-4" />}>
          <input
            {...register("recipientStreet")}
            placeholder="Số nhà, tên đường *"
            className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
          />
        </InputIcon>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputIcon icon={<MapPin className="w-4 h-4" />}>
          <select
            {...register("recipientDistrict")}
            className="w-full bg-transparent outline-none text-sm text-foreground cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled className="text-muted-foreground">
              Chọn Quận / Huyện
            </option>
            {districts.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
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
            <option value="" className="text-muted-foreground">
              {loading ? "Đang tải..." : district ? "Chọn Phường / Xã" : "Chọn Quận trước"}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </InputIcon>
      </div>
    </div>
  );
}
