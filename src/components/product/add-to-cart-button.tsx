"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/schema";
import { formatPrice } from "@/lib/utils";
import { getDisplayPrice } from "@/lib/product-utils";
import QuantityInput from "@/components/ui/quantity-input";
import { useSettings } from "@/hooks/use-settings";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { addToast } = useToast();
  const contact = useSettings();

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

          <a
            href={`${contact.zalo}?text=${encodeURIComponent(`Mình muốn đặt: ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-5 py-3.5 rounded-full border-2 border-[#0068FF] text-[#0068FF] font-semibold hover:bg-[#0068FF]/5 transition-colors"
          >
            Đặt Zalo
          </a>
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

          <a
            href={`${contact.zalo}?text=${encodeURIComponent(`Mình muốn đặt: ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full border-2 border-[#0068FF] text-[#0068FF] active:bg-[#0068FF]/5 transition-colors"
            aria-label="Đặt Zalo"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.03 2 10.8c0 2.63 1.35 4.97 3.47 6.54v3.66l3.83-2.08c.84.22 1.73.34 2.7.34 5.52 0 10-4.03 10-8.8S17.52 2 12 2zm4.4 6.6l-2.2 4.2c-.2.4-.7.5-1.1.3l-1.8-1.2-1.4 1.4c-.2.2-.5.2-.7 0-.2-.2-.2-.5 0-.7l1.5-1.5c.2-.2.5-.2.7 0l1.7 1.1 1.9-3.7c.1-.3.5-.4.7-.2.3.1.4.4.2.7z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}
