"use client";

import { Truck, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { CheckoutForm, ShippingZone } from "@/schema";
import CardSection from "./card-section";
import { formatPrice } from "@/lib/utils";

interface Props {
  zones: ShippingZone[];
  shippingIdx: number;
  setValue: UseFormSetValue<CheckoutForm>;
}

export default function ShippingZones({ zones, shippingIdx, setValue }: Props) {
  const [showTable, setShowTable] = useState(false);
  const pickupIdx = zones.findIndex((z) => z.fee === 0);
  const hasPickup = pickupIdx !== -1;
  const isPickup = hasPickup && shippingIdx === pickupIdx;
  const currentZone = zones[shippingIdx];
  const deliveryZones = zones.filter((z) => z.fee > 0);

  return (
    <CardSection icon={<Truck className="w-4 h-4" />} title="Vận Chuyển">
      {/* Current zone indicator */}
      {!isPickup && currentZone && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/15 rounded-xl px-3.5 py-2.5 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">Khu vực:</span>
            <span className="font-medium text-foreground">{currentZone.label}</span>
          </div>
          <span className="text-sm font-bold text-primary shrink-0">
            {currentZone.fee === 0 ? "Miễn phí" : formatPrice(currentZone.fee)}
          </span>
        </div>
      )}

      {/* Pickup option — chỉ hiện nếu admin đã tạo zone fee=0 */}
      {hasPickup && (
        <>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPickup}
              onChange={(e) => setValue("shippingIdx", e.target.checked ? pickupIdx : 0)}
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
        </>
      )}

      {/* Collapsible fee table */}
      {deliveryZones.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Xem bảng phí ship theo khu vực
          </button>
          {showTable && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border/60">
              {deliveryZones.map((zone) => (
                <div
                  key={zone.id}
                  className={`flex items-center justify-between px-3.5 py-2 text-xs border-b border-border/40 last:border-0 ${
                    zones.indexOf(zone) === shippingIdx && !isPickup
                      ? "bg-primary/5 text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <span>{zone.label}</span>
                  <span className="font-semibold shrink-0 ml-3">
                    {zone.fee === 0 ? "Miễn phí" : formatPrice(zone.fee)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </CardSection>
  );
}
