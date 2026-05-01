"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/components/product/price-display";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-6">Hãy chọn thêm hoa để tiếp tục nhé!</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Mua sắm ngay
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
            const thumbUrl = product.thumbnail
              ? `${PB_URL}/api/files/${product.collectionId}/${product.id}/${product.thumbnail}?thumb=200x200`
              : null;
            const price = product.sale_price ?? product.price;

            return (
              <div
                key={product.id}
                className="flex gap-4 p-4 bg-white rounded-xl border border-border"
              >
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {thumbUrl ? (
                    <Image src={thumbUrl} alt={product.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-primary font-semibold text-sm mt-1">{formatPrice(price)}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
                      = {formatPrice(price * quantity)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(product.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 self-start"
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
          <div className="bg-white rounded-xl border border-border p-5 sticky top-24 space-y-4">
            <h2 className="font-heading font-semibold text-lg">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="font-medium">{formatPrice(totalPrice())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giao hàng</span>
              <span className="text-primary font-medium">Miễn phí nội thành</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-semibold">
              <span>Tổng cộng</span>
              <span className="text-primary text-lg">{formatPrice(totalPrice())}</span>
            </div>
            <Link
              href="/dat-hoa"
              className="block w-full text-center py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
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
