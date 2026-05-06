"use client";

import { Truck } from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";
import type { CheckoutForm } from "@/lib/checkout-schema";
import CardSection from "./card-section";
import { SHIPPING_ZONES } from "@/lib/shipping-config";
import { formatPrice } from "@/lib/utils";

interface Props {
  shippingIdx: number;
  setValue: UseFormSetValue<CheckoutForm>;
}

export default function ShippingZones({ shippingIdx, setValue }: Props) {
  return (
    <CardSection icon={<Truck className="w-4 h-4" />} title="Phí vận chuyển">
      <div className="space-y-2.5">
        {SHIPPING_ZONES.map((zone, i) => (
          <label key={i} className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <input
              type="radio"
              name="shipping"
              checked={shippingIdx === i}
              onChange={() => setValue("shippingIdx", i)}
              className="mt-0.5 accent-primary"
            />
            <span className="text-sm flex-1 leading-snug">{zone.label}</span>
            {zone.fee > 0 ? (
              <span className="text-sm font-bold text-primary shrink-0">{formatPrice(zone.fee)}</span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">Miễn phí</span>
            )}
          </label>
        ))}
      </div>
    </CardSection>
  );
}
