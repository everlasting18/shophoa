"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/schema";
import { formatPrice } from "@/lib/utils";
import { getDisplayPrice } from "@/lib/product-utils";
import QuantityInput from "@/components/ui/quantity-input";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { addToast } = useToast();

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`, "success");
    setTimeout(() => setAdded(false), 2000);
  }

  const displayPrice = getDisplayPrice(product.price, product.sale_price);

  return (
    <>
      {/* Desktop */}
      <div className="space-y-4 hidden md:block">
        {/* Quantity */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Số lượng:</span>
          <QuantityInput value={qty} onChange={setQty} />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/15"
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Đã thêm!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Thêm vào giỏ
              </>
            )}
          </button>

          
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border/60 px-4 py-3 md:hidden">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <QuantityInput value={qty} onChange={setQty} className="shrink-0 [&>button]:w-8 [&>button]:h-9 [&>span]:w-8" />

          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-primary text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-primary/15"
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Đã thêm
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Thêm – {formatPrice(displayPrice * qty)}
              </>
            )}
          </button>

        </div>
      </div>
    </>
  );
}
