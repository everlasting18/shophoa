"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PriceDisplay from "@/components/product/price-display";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/schema";
import { getThumbUrl } from "@/lib/media";
import { hasSale } from "@/lib/product-utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { addToast } = useToast();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`, "success");
  }

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group block bg-white rounded-2xl border border-border/60 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={getThumbUrl(product.collectionId, product.id, product.thumbnail)}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasSale(product.price, product.sale_price) && (
            <Badge className="bg-primary text-white text-[10px] px-2 py-0.5 font-semibold shadow-sm">
              Sale
            </Badge>
          )}
        </div>
        {product.is_best_seller && (
          <div className="absolute top-2.5 right-2.5">
            <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5 font-semibold shadow-sm">
              Bán chạy
            </Badge>
          </div>
        )}

        {/* Quick actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            aria-label="Thêm vào giỏ hàng"
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <PriceDisplay price={product.price} salePrice={product.sale_price} />
      </div>
    </Link>
  );
}
