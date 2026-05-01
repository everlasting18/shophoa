"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PriceDisplay from "@/components/product/price-display";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

function getThumbUrl(product: Product) {
  if (!product.thumbnail || typeof product.thumbnail !== "string") return "/images/placeholder-flower.svg";
  return `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.thumbnail}?thumb=480x480`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const hasSale = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.price;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  }

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group block bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={getThumbUrl(product)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasSale && (
          <Badge className="absolute top-2 left-2 bg-primary text-white text-[10px] px-1.5 py-0.5">
            Sale
          </Badge>
        )}
        {product.is_best_seller && (
          <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5">
            Bán chạy
          </Badge>
        )}
        <button
          onClick={handleAddToCart}
          aria-label="Thêm vào giỏ hàng"
          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:bg-primary hover:text-white"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <PriceDisplay price={product.price} salePrice={product.sale_price} />
      </div>
    </Link>
  );
}
