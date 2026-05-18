"use client";

import Image from "next/image";
import { Package, CheckCircle2, AlertCircle } from "lucide-react";
import CardSection from "./card-section";
import { formatPrice } from "@/lib/utils";
import { getThumbUrl } from "@/lib/media";
import { getDisplayPrice } from "@/lib/product-utils";
import { isoToDisplay } from "@/lib/date-utils";
import QuantityInput from "@/components/ui/quantity-input";
import type { CartItem } from "@/schema";

interface Props {
  items: { product: CartItem["product"]; quantity: number }[];
  shippingFee: number;
  total: number;
  subtotal: number;
  loading: boolean;
  submitError: string;
  onUpdateQuantity: (productId: string, qty: number) => void;
  deliveryDate?: string;
  deliveryTime?: string;
  customerName?: string;
  recipientName?: string;
}

export default function OrderSummary({
  items,
  shippingFee,
  total,
  subtotal,
  loading,
  submitError,
  onUpdateQuantity,
  deliveryDate,
  deliveryTime,
  customerName,
  recipientName,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Products */}
      <CardSection icon={<Package className="w-4 h-4" />} title="Sản Phẩm">
        <div className="space-y-4">
          {items.map(({ product, quantity }) => {
            const price = getDisplayPrice(product.price, product.sale_price);
            return (
              <div key={product.id} className="flex items-center gap-3">
                <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-muted border border-border/40">
                  <Image
                    src={getThumbUrl(product.collectionId, product.id, product.thumbnail, "150x150")}
                    alt={product.name}
                    fill
                    priority
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <QuantityInput
                      value={quantity}
                      onChange={(v) => onUpdateQuantity(product.id, v)}
                      className="rounded-lg [&>button]:w-7 [&>button]:h-7 [&>span]:w-7 [&>span]:text-xs [&>span]:font-semibold"
                    />
                  </div>
                </div>
                <p className="text-sm font-bold shrink-0">{formatPrice(price * quantity)}</p>
              </div>
            );
          })}
        </div>
      </CardSection>

      {/* Total + bank + submit */}
      <CardSection>
        {/* Compact Delivery Info */}
        {(customerName || deliveryDate) && (
          <div className="mb-4 pb-4 border-b border-border/40 space-y-1.5 text-[13px] text-muted-foreground">
            {customerName && (
              <p className="flex items-center gap-2 truncate">
                <span className="text-primary font-medium shrink-0 flex justify-center">👤</span>
                {recipientName && customerName !== recipientName ? (
                  <span className="truncate">Đặt: <span className="font-medium text-foreground">{customerName}</span> → Nhận: <span className="font-medium text-foreground">{recipientName}</span></span>
                ) : (
                  <span className="truncate">Khách hàng: <span className="font-medium text-foreground">{customerName}</span></span>
                )}
              </p>
            )}
            {deliveryDate && (
              <p className="flex items-center gap-2 truncate">
                <span className="text-primary font-medium shrink-0 flex justify-center">🕒</span>
                <span>
                  Giao: <span className="font-medium text-foreground">{isoToDisplay(deliveryDate)}</span>
                  {deliveryTime && <span className="font-medium text-foreground"> lúc {deliveryTime}</span>}
                </span>
              </p>
            )}
          </div>
        )}

        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            <span className="font-medium">
              {shippingFee === 0 ? (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Miễn phí</span>
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="font-semibold">Tổng cộng</span>
          <span className="font-bold text-xl text-primary">{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Tạm tính · Cửa hàng sẽ báo phí ship phụ thu nếu có khi liên hệ
        </p>

        {submitError && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="hidden lg:flex w-full py-3.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/15 items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Đang xử lý...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Đặt Hoa
            </>
          )}
        </button>
      </CardSection>
    </div>
  );
}

