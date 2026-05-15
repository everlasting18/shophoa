"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight, Flower2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { getThumbUrl } from "@/lib/media";
import { getDisplayPrice } from "@/lib/product-utils";
import QuantityInput from "@/components/ui/quantity-input";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
          Hãy chọn thêm hoa đẹp để gửi gắm yêu thương nhé!
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/15"
        >
          Mua sắm ngay
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-8">Giỏ Hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => {
            const price = getDisplayPrice(product.price, product.sale_price);

            return (
              <div
                key={product.id}
                className="flex gap-4 p-4 bg-white rounded-2xl border border-border/60 hover:border-border transition-colors"
              >
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                  {product.thumbnail ? (
                    <Image
                      src={getThumbUrl(product.collectionId, product.id, product.thumbnail, "200x200")}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Flower2 className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-primary font-bold text-sm mt-1">{formatPrice(price)}</p>

                  <div className="flex items-center gap-2 mt-2.5">
                    <QuantityInput
                      value={quantity}
                      onChange={(v) => updateQuantity(product.id, v)}
                      className="rounded-lg [&>button]:w-7 [&>button]:h-7 [&>span]:w-8 [&>span]:text-sm [&>span]:font-medium"
                    />
                    <span className="text-xs text-muted-foreground ml-1">
                      = {formatPrice(price * quantity)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(product.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/5 self-start"
                  aria-label="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-border/60 p-6 sticky top-24 space-y-5">
            <h2 className="font-heading font-semibold text-lg">Tóm tắt đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-medium">{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giao hàng</span>
                <span className="text-primary font-medium text-xs bg-primary/5 px-2 py-0.5 rounded-full">
                  Miễn phí nội thành
                </span>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-bold text-base">
              <span>Tổng cộng</span>
              <span className="text-primary text-lg">{formatPrice(totalPrice())}</span>
            </div>
            <Link
              href="/dat-hoa"
              className="block w-full text-center py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/15"
            >
              Đặt Hoa Ngay
            </Link>
            <Link
              href="/"
              className="block w-full text-center py-2.5 rounded-full border border-border text-sm hover:bg-muted transition-colors"
            >
              Tiếp tục mua
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
