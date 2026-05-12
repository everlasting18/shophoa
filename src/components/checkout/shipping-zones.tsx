"use client";

import { useState } from "react";
import { Truck, ChevronDown, Info } from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";
import type { CheckoutForm } from "@/schema";
import CardSection from "./card-section";
import { SHIPPING_ZONES } from "@/config";
import { formatPrice } from "@/lib/utils";

interface Props {
  shippingIdx: number;
  setValue: UseFormSetValue<CheckoutForm>;
}

export default function ShippingZones({ shippingIdx, setValue }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const currentZone = SHIPPING_ZONES[shippingIdx];

  return (
    <CardSection>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-heading font-semibold text-base group outline-none"
      >
        <span className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          Phí vận chuyển
        </span>
        <span className="flex items-center gap-2 text-sm font-normal text-muted-foreground group-hover:text-primary transition-colors">
          {!isOpen && (
            <span className="truncate max-w-[150px] sm:max-w-[250px] hidden sm:inline-block">
              {currentZone.label}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {/* Hint & Selected summary (mobile fallback) */}
      {!isOpen && (
        <div className="mt-1 ml-6 text-left">
          <p className="text-sm text-primary font-medium sm:hidden truncate max-w-full">
            {currentZone.label}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 opacity-80">
            <Info className="w-3 h-3" />
            Nhấn vào để thay đổi khu vực giao hàng
          </p>
        </div>
      )}

      {isOpen && (
        <div className="space-y-2 mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
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
      )}
    </CardSection>
  );
}
