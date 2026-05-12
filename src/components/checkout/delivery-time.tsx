"use client";

import { Calendar, Clock } from "lucide-react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { CheckoutForm } from "@/schema";
import CardSection from "./card-section";
import InputIcon from "@/components/ui/input-icon";
import { TIME_GROUPS } from "@/config";
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
    
    // Reset time when changing date to prevent invalid selections
    setValue("deliveryTime", "");
  }

  function handleCustomDate(date: string) {
    setCustomDate(date);
    setValue("deliveryDate", date);
    setValue("deliveryTime", "");
  }

  // Get current hour and minute to disable past slots for 'today'
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isToday = deliveryDate === todayISO;

  function isSlotDisabled(slot: string) {
    if (!isToday) return false;
    const [slotHour, slotMinute] = slot.split(":").map(Number);
    // Disable if slot is strictly before current time
    if (slotHour < currentHour) return true;
    if (slotHour === currentHour && slotMinute <= currentMinute) return true;
    return false;
  }

  return (
    <CardSection icon={<Calendar className="w-4 h-4" />} title="Thời gian giao hoa">
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">
          Chọn ngày giao <span className="text-destructive">*</span>
        </p>
        <div className="flex gap-2.5">
          {(["today", "tomorrow", "custom"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleDateMode(mode)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full border transition-all ${
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
            <p className="text-sm text-primary font-medium mt-3 flex items-center gap-1.5 ml-1">
              <Calendar className="w-3.5 h-3.5" />
              {isoToDisplay(deliveryDate)}
            </p>
          )
        )}
      </div>

      <div className="mt-6 border-t border-border/60 pt-5">
        <p className="text-sm font-medium mb-3">
          Chọn giờ giao (Giờ:Phút) <span className="text-destructive">*</span>
        </p>
        <InputIcon icon={<Clock className="w-4 h-4" />}>
          <input
            type="time"
            value={deliveryTime}
            onChange={(e) => setValue("deliveryTime", e.target.value)}
            className="w-full bg-transparent outline-none text-sm py-1"
          />
        </InputIcon>
      </div>
    </CardSection>
  );
}
