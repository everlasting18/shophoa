"use client";

import { User, Phone, MapPin, Gift } from "lucide-react";
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { CheckoutForm } from "@/schema";
import CardSection from "./card-section";
import InputIcon from "@/components/ui/input-icon";
import AddressFields from "./address-fields";

interface Props {
  register: UseFormRegister<CheckoutForm>;
  setValue: UseFormSetValue<CheckoutForm>;
  watch: UseFormWatch<CheckoutForm>;
}

export default function CustomerForms({ register, setValue, watch }: Props) {
  const sameAsBuyer = watch("sameAsBuyer");
  const customerName = watch("customerName");

  // sameAsBuyer = true means buyer IS recipient (default)
  // sameAsBuyer = false means buyer is NOT recipient (gifting)
  const isGifting = !sameAsBuyer;

  function setGifting(v: boolean) {
    setValue("sameAsBuyer", !v);
    if (!v) {
      setValue("recipientName", "");
      setValue("recipientPhone", "");
    }
  }

  return (
    <>
      {/* Buyer */}
      <CardSection icon={<User className="w-4 h-4" />} title="Thông tin người đặt / Your details">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Họ tên / Full name <span className="text-destructive">*</span></p>
              <InputIcon icon={<User className="w-4 h-4" />}>
                <input
                  {...register("customerName")}
                  placeholder="Nhập họ tên / Enter your name"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                />
              </InputIcon>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Số điện thoại / Phone <span className="text-destructive">*</span></p>
              <InputIcon icon={<Phone className="w-4 h-4" />}>
                <input
                  {...register("customerPhone")}
                  placeholder="Nhập số điện thoại / Enter phone number"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                />
              </InputIcon>
            </div>
          </div>
        </div>
      </CardSection>

      {/* Default: buyer = recipient */}
      {!isGifting && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm">
          <Gift className="w-4 h-4 text-primary shrink-0" />
          <span className="flex-1">
            Hoa giao đến / Delivered to{" "}
            <strong>{customerName || "bạn"}</strong>
          </span>
          <button
            type="button"
            onClick={() => setGifting(true)}
            className="text-xs text-primary hover:underline font-medium shrink-0"
          >
            Đặt tặng người khác / Send as gift
          </button>
        </div>
      )}

      {/* Expanded: gifting to someone else */}
      {isGifting && (
        <CardSection>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-base flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              Người nhận hoa / Recipient
            </h3>
            <button
              type="button"
              onClick={() => setGifting(false)}
              className="text-xs text-primary hover:underline font-medium transition-colors flex items-center gap-1 shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              Đặt cho chính mình / For myself
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Họ tên người nhận / Recipient name <span className="text-destructive">*</span></p>
              <InputIcon icon={<User className="w-4 h-4" />}>
                <input
                  {...register("recipientName")}
                  placeholder="Nhập họ tên / Enter name"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                />
              </InputIcon>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Số điện thoại / Phone <span className="text-destructive">*</span></p>
              <InputIcon icon={<Phone className="w-4 h-4" />}>
                <input
                  {...register("recipientPhone")}
                  placeholder="Nhập số điện thoại / Enter phone number"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                />
              </InputIcon>
            </div>
          </div>
        </CardSection>
      )}

      {/* Address */}
      <CardSection icon={<MapPin className="w-4 h-4" />} title="Địa chỉ giao hàng / Delivery address">
        <AddressFields register={register} />
      </CardSection>
    </>
  );
}
