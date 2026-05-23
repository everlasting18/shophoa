"use client";

import { MapPin } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";
import type { CheckoutForm } from "@/schema";
import InputIcon from "@/components/ui/input-icon";

interface Props {
  register: UseFormRegister<CheckoutForm>;
}

export default function AddressFields({ register }: Props) {
  return (
    <InputIcon icon={<MapPin className="w-4 h-4" />}>
      <input
        {...register("recipientStreet")}
        placeholder="Số nhà, tên đường, phường/quận *"
        className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
      />
    </InputIcon>
  );
}
