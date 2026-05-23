"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`, "success");
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    router.push("/dat-hoa");
  }

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      draggable={false}
      className="group block bg-[#F5EFE3] rounded-2xl border border-[#C8B89A] overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={getThumbUrl(product.collectionId, product.id, product.thumbnail)}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Badges — gom vào cùng 1 góc trái, stack dọc */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.is_best_seller && (
            <Badge className="bg-red-600 text-white text-[10px] px-2 py-0.5 font-semibold shadow-sm">
              Bán chạy
            </Badge>
          )}
          {hasSale(product.price, product.sale_price) && (
            <Badge className="bg-red-600 text-white text-[10px] px-2 py-0.5 font-semibold shadow-sm">
              Sale
            </Badge>
          )}
        </div>

      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col">
        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-2 h-10 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="h-7 flex items-center">
          <PriceDisplay price={product.price} salePrice={product.sale_price} />
        </div>
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={handleBuyNow}
            className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all"
          >
            Mua ngay
          </button>
          <button
            onClick={handleAddToCart}
            aria-label="Thêm vào giỏ hàng"
            className="w-9 h-9 rounded-xl border border-[#C8B89A] bg-[#EEE5D3]/60 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary active:scale-95 transition-all shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}