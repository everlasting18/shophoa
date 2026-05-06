"use client";

import { Calendar, Clock } from "lucide-react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { CheckoutForm } from "@/lib/checkout-schema";
import CardSection from "./card-section";
import InputIcon from "@/components/ui/input-icon";
import { TIME_GROUPS } from "@/lib/shipping-config";
import { isoToDisplay, addDaysToISO } from "@/lib/date-utils";

interface Props {
  todayISO: string;
  dateMode: "today" | "tomorrow" | "custom";
  setDateMode: (mode: "today" | "tomorrow" | "custom") => void;
  customDate: string;
  setCustomDate: (date: string) => void;
  setValue: UseFormSetValue<CheckoutForm>;
  watch: UseFormWatch<CheckoutForm>;
}

export default function DeliveryTime({ todayISO, dateMode, setDateMode, customDate, setCustomDate, setValue, watch }: Props) {
  const deliveryDate = watch("deliveryDate");
  const deliveryTime = watch("deliveryTime");

  function handleDateMode(mode: typeof dateMode) {
    setDateMode(mode);
    if (mode === "today") setValue("deliveryDate", todayISO);
    else if (mode === "tomorrow") setValue("deliveryDate", addDaysToISO(todayISO, 1));
    else setValue("deliveryDate", customDate || "");
  }

  function handleCustomDate(date: string) {
    setCustomDate(date);
    setValue("deliveryDate", date);
  }

  return (
    <CardSection icon={<Calendar className="w-4 h-4" />} title="Thời gian giao hoa">
      <div className="mb-5">
        <p className="text-sm font-medium mb-2.5">
          Chọn ngày giao <span className="text-destructive">*</span>
        </p>
        <div className="flex gap-2">
          {(["today", "tomorrow", "custom"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleDateMode(mode)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                dateMode === mode
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/10"
                  : "bg-white border-border hover:border-primary/30"
              }`}
            >
              {mode === "today" ? "Hôm nay" : mode === "tomorrow" ? "Ngày mai" : "Khác"}
            </button>
          ))}
        </div>
        {dateMode === "custom" ? (
          <div className="mt-3">
            <InputIcon icon={<Calendar className="w-4 h-4" />}>
              <input
                type="date"
                value={customDate}
                min={todayISO}
                onChange={(e) => handleCustomDate(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              />
            </InputIcon>
          </div>
        ) : (
          deliveryDate && (
            <p className="text-sm text-primary font-medium mt-2.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {isoToDisplay(deliveryDate)}
            </p>
          )
        )}
      </div>

      <p className="text-sm font-medium mb-2.5">
        Chọn giờ giao <span className="text-destructive">*</span>
      </p>
      <div className="space-y-3">
        {TIME_GROUPS.map(({ period, slots }) => (
          <div key={period}>
            <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {period}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setValue("deliveryTime", slot)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                    deliveryTime === slot
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white border-border hover:border-primary/30"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardSection>
  );
}
