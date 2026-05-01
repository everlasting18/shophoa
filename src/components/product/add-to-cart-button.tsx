"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/lib/types";
import { CONTACT } from "@/lib/constants";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Số lượng:</span>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors text-lg font-medium"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors text-lg font-medium"
          >
            +
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 active:scale-95 transition-all"
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
          href={`${CONTACT.zalo}?text=${encodeURIComponent(`Mình muốn đặt: ${product.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-5 py-3 rounded-full border-2 border-[#0068FF] text-[#0068FF] font-semibold hover:bg-[#0068FF]/5 transition-colors"
        >
          Đặt Zalo
        </a>
      </div>
    </div>
  );
}
