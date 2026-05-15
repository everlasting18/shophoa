"use client";

import { Truck } from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";
import type { CheckoutForm } from "@/schema";
import CardSection from "./card-section";
import { SHIPPING_ZONES } from "@/config";

const PICKUP_IDX = SHIPPING_ZONES.findIndex((z) => z.label.includes("cửa hàng"));

interface Props {
  shippingIdx: number;
  setValue: UseFormSetValue<CheckoutForm>;
}

export default function ShippingZones({ shippingIdx, setValue }: Props) {
  const isPickup = shippingIdx === PICKUP_IDX;

  return (
    <CardSection>
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isPickup}
          onChange={(e) => setValue("shippingIdx", e.target.checked ? PICKUP_IDX : 0)}
          className="w-4 h-4 accent-primary rounded shrink-0"
        />
        <span className="flex items-center gap-2 text-sm font-medium flex-1">
          <Truck className="w-4 h-4 text-primary shrink-0" />
          Tự đến lấy tại cửa hàng
        </span>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
          Miễn phí
        </span>
      </label>
      {isPickup && (
        <p className="mt-2 ml-7 text-xs text-muted-foreground leading-relaxed">
          Vui lòng đến địa chỉ tiệm để nhận hoa theo khung giờ đã chọn.
        </p>
      )}
    </CardSection>
  );
}
