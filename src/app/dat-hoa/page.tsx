"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Info, CreditCard, Package, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import pb from "@/services/pocketbase";
import { checkoutSchema, type CheckoutForm } from "@/schema";
import { SHIPPING_ZONES } from "@/config";
import { todayISO, isoToDisplay } from "@/lib/date-utils";
import { formatPrice } from "@/lib/utils";
import ProgressSteps from "@/components/checkout/progress-steps";
import DeliveryTime from "@/components/checkout/delivery-time";
import CustomerForms from "@/components/checkout/customer-forms";
import ShippingZones from "@/components/checkout/shipping-zones";
import OrderSummary from "@/components/checkout/order-summary";
import CardSection from "@/components/checkout/card-section";
import FormError from "@/components/ui/form-error";

const STORAGE_KEY = "checkout-form";

const DISTRICT_ZONE_MAP: Record<string, number> = {
  "Quận 1": 0, "Quận 3": 0, "Quận 5": 0, "Quận 10": 0,
  "Quận 4": 1, "Quận Phú Nhuận": 1,
  "Quận 6": 2, "Quận 7": 2, "Quận 8": 2, "Quận 11": 2,
  "Quận Bình Thạnh": 3,
  "Quận Tân Bình": 4, "Quận Bình Tân": 4, "Quận Tân Phú": 4, "Quận Gò Vấp": 4,
  "Quận 2": 5,
  "Quận 9": 6, "Quận 12": 6, "Huyện Nhà Bè": 6, "Huyện Bình Chánh": 6, "Huyện Hóc Môn": 6, "Thành phố Thủ Đức": 6,
};

const ERROR_FIELDS: Record<string, string> = {
  customerName: "customerName",
  customerPhone: "customerPhone",
  recipientName: "recipientName",
  recipientPhone: "recipientPhone",
  recipientStreet: "recipientStreet",
  deliveryDate: "deliveryDate",
  deliveryTime: "deliveryTime",
};

function loadSavedForm() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, totalPrice, clearCart } = useCartStore();
  const { addToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const iso = useMemo(() => todayISO(), []);
  const saved = useMemo(() => loadSavedForm(), []);

  const [dateMode, setDateMode] = useState<"today" | "tomorrow" | "custom">(
    saved?.deliveryDate && saved.deliveryDate !== iso && saved.deliveryDate !== todayISO() ? "custom" : "today"
  );
  const [customDate, setCustomDate] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      recipientName: "",
      recipientPhone: "",
      recipientAddress: "",
      recipientStreet: "",
      recipientWard: "",
      recipientDistrict: "",
      deliveryDate: iso,
      deliveryTime: "",
      shippingIdx: 0,
      sameAsBuyer: true,
      note: "",
      ...(saved && { ...saved, deliveryDate: saved.deliveryDate || iso }),
    },
  });

  const shippingIdx = useWatch({ control, name: "shippingIdx" }) as number;
  const district = useWatch({ control, name: "recipientDistrict" }) as string;
  const allFormValues = useWatch({ control });
  const shippingFee = SHIPPING_ZONES[shippingIdx]?.fee ?? 0;
  const subtotal = totalPrice();
  const total = subtotal + shippingFee;
  const isPickup =
    SHIPPING_ZONES[shippingIdx]?.fee === 0 &&
    SHIPPING_ZONES[shippingIdx]?.label.includes("cửa hàng");

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Auto map district → shipping zone
  useEffect(() => {
    if (district && district in DISTRICT_ZONE_MAP) {
      setValue("shippingIdx", DISTRICT_ZONE_MAP[district]);
    }
  }, [district, setValue]);

  // Save form to sessionStorage on every change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFormValues));
    }, 500);
    return () => clearTimeout(timer);
  }, [allFormValues]);

  // Scroll to first error on validation fail
  const prevErrorCount = useRef(0);
  useEffect(() => {
    const keys = Object.keys(errors);
    if (keys.length === 0) {
      prevErrorCount.current = 0;
      return;
    }
    if (keys.length <= prevErrorCount.current) return;
    prevErrorCount.current = keys.length;

    const firstField = ERROR_FIELDS[keys[0]] || keys[0];
    const el = formRef.current?.querySelector(`[name="${firstField}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus?.();
    }
  }, [errors]);

  const onSubmit = useCallback(async (data: CheckoutForm) => {
    setLoading(true);
    setSubmitError("");
    try {
      const finalName = data.sameAsBuyer ? data.customerName : data.recipientName;
      const finalPhone = data.sameAsBuyer ? data.customerPhone : data.recipientPhone;
      const finalAddress = isPickup
        ? "Lấy tại cửa hàng"
        : [data.recipientStreet, data.recipientWard, data.recipientDistrict, data.recipientAddress]
            .filter(Boolean)
            .join(", ");

      const orderItems = items.map(({ product, quantity }) => ({
        product_id: product.id,
        name: product.name,
        price: product.sale_price > 0 ? product.sale_price : product.price,
        quantity,
      }));

      const orderCode = `VHT${Date.now().toString(36).slice(-6).toUpperCase()}`;

      const record = await pb.collection("orders").create({
        order_code: orderCode,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        recipient_name: finalName,
        recipient_phone: finalPhone,
        recipient_address: finalAddress,
        delivery_date: data.deliveryDate,
        delivery_time: data.deliveryTime,
        items: orderItems,
        subtotal,
        total,
        note: `[Ship: ${SHIPPING_ZONES[data.shippingIdx].label}] ${data.note}`.trim(),
        status: "pending",
        payment_method: "bank_transfer",
      });

      sessionStorage.removeItem(STORAGE_KEY);
      clearCart();
      addToast("Đặt hoa thành công!", "success");
      router.push(`/dat-hoa/cam-on?code=${encodeURIComponent(orderCode)}`);
    } catch {
      setSubmitError("Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ Zalo.");
      addToast("Đặt hàng thất bại, vui lòng thử lại", "error");
    } finally {
      setLoading(false);
    }
  }, [isPickup, items, subtotal, total, clearCart, addToast, router]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <Package className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground mb-4">Giỏ hàng trống</p>
        <Link href="/" className="text-primary hover:underline font-medium">
          ← Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-40 lg:pb-0">
      <ProgressSteps />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Link
          href="/gio-hang"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Giỏ hàng
        </Link>

        <div className="flex gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 text-sm text-emerald-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <p className="font-semibold">Tiệm hoa nhà tình giao hoa tận nơi tại TP. Hồ Chí Minh.</p>
            <p className="opacity-80 mt-0.5">
              Sau khi thanh toán thành công hãy nhắn đơn bạn đến Zalo để chúng mình check đơn nhanh nhất nhé!
            </p>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
            {/* LEFT */}
            <div className="space-y-5">
              <DeliveryTime
                todayISO={iso}
                dateMode={dateMode}
                setDateMode={setDateMode}
                customDate={customDate}
                setCustomDate={setCustomDate}
                setValue={setValue}
                watch={watch}
              />
              {errors.deliveryDate && <FormError msg={errors.deliveryDate.message!} />}
              {errors.deliveryTime && <FormError msg={errors.deliveryTime.message!} />}

              <CustomerForms register={register} setValue={setValue} watch={watch} isPickup={isPickup} />
              {errors.customerName && <FormError msg={errors.customerName.message!} />}
              {errors.customerPhone && <FormError msg={errors.customerPhone.message!} />}
              {errors.recipientName && <FormError msg={errors.recipientName.message!} />}
              {errors.recipientPhone && <FormError msg={errors.recipientPhone.message!} />}
              {errors.recipientStreet && <FormError msg={errors.recipientStreet.message!} />}

              <ShippingZones shippingIdx={shippingIdx} setValue={setValue} />

              {/* Note */}
              <CardSection icon={<CreditCard className="w-4 h-4" />} title="Nội Dung Thiệp / Decal (tuỳ chọn)">
                <textarea
                  {...register("note")}
                  rows={4}
                  placeholder="Thời gian nhận Hoa - Nội dung Thiệp Hoặc Decal."
                  className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60 resize-none"
                />
              </CardSection>
            </div>

            {/* RIGHT – desktop only */}
            <div className="hidden lg:block">
              <OrderSummary
                items={items}
                shippingFee={shippingFee}
                total={total}
                subtotal={subtotal}
                loading={loading}
                submitError={submitError}
                onUpdateQuantity={updateQuantity}
                deliveryDate={allFormValues.deliveryDate}
                deliveryTime={allFormValues.deliveryTime}
                customerName={allFormValues.customerName}
                recipientName={allFormValues.sameAsBuyer ? allFormValues.customerName : allFormValues.recipientName}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border/60 px-4 py-3 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-lg mx-auto">
          {/* Compact Info Row */}
          {(allFormValues.customerName || allFormValues.deliveryDate) && (
            <div className="flex items-center gap-2 mb-2.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 px-2.5 py-1.5 rounded-lg truncate">
              {allFormValues.customerName && (
                <span className="flex items-center gap-1 truncate shrink">
                  <span className="shrink-0">👤</span> <span className="font-medium text-foreground truncate">{allFormValues.sameAsBuyer ? allFormValues.customerName : allFormValues.recipientName || allFormValues.customerName}</span>
                </span>
              )}
              {allFormValues.customerName && allFormValues.deliveryDate && <span className="shrink-0 opacity-50">•</span>}
              {allFormValues.deliveryDate && (
                <span className="flex items-center gap-1 truncate shrink-0">
                  <span className="shrink-0">🕒</span> <span className="font-medium text-foreground">{isoToDisplay(allFormValues.deliveryDate)}{allFormValues.deliveryTime && ` - ${allFormValues.deliveryTime}`}</span>
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Tổng cộng</p>
              <p className="text-lg font-bold text-primary">{formatPrice(total)}</p>
            </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => formRef.current?.requestSubmit()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-primary/15 disabled:opacity-60"
          >
            {loading ? (
              <span className="animate-pulse">Đang xử lý...</span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Đặt Hoa
              </>
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
