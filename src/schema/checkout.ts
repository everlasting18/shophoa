import { z } from "zod";
import { SHIPPING_ZONES } from "@/config";

export const checkoutSchema = z
  .object({
    customerName: z.string().min(1, "Vui lòng nhập họ tên"),
    customerPhone: z.string().regex(/^0[0-9]{9}$/, "SĐT không hợp lệ"),
    recipientName: z.string(),
    recipientPhone: z.string(),
    recipientAddress: z.string(),
    recipientStreet: z.string(),
    recipientWard: z.string(),
    recipientDistrict: z.string(),
    deliveryDate: z.string(),
    deliveryTime: z.string().min(1, "Vui lòng chọn giờ giao"),
    shippingIdx: z.number().min(0).max(SHIPPING_ZONES.length - 1),
    sameAsBuyer: z.boolean(),
    note: z.string(),
  })
  .refine((d) => d.sameAsBuyer || d.recipientName.trim().length > 0, {
    message: "Vui lòng nhập tên người nhận",
    path: ["recipientName"],
  })
  .refine((d) => d.sameAsBuyer || /^0[0-9]{9}$/.test(d.recipientPhone), {
    message: "SĐT không hợp lệ",
    path: ["recipientPhone"],
  })
  .refine((d) => {
    const zone = SHIPPING_ZONES[d.shippingIdx];
    const isPickup = zone.fee === 0 && zone.label.includes("cửa hàng");
    return isPickup || d.recipientStreet.trim().length > 0;
  }, {
    message: "Vui lòng nhập số nhà, tên đường",
    path: ["recipientStreet"],
  })
  .refine((d) => d.deliveryDate.length > 0, {
    message: "Vui lòng chọn ngày giao",
    path: ["deliveryDate"],
  });

export type CheckoutForm = z.infer<typeof checkoutSchema>;
