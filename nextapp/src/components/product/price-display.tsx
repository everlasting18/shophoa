import { formatPrice } from "@/lib/utils";
import { hasSale } from "@/lib/product-utils";

interface PriceDisplayProps {
  price: number;
  salePrice?: number | null;
  className?: string;
}

export default function PriceDisplay({ price, salePrice, className = "" }: PriceDisplayProps) {
  if (hasSale(price, salePrice)) {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <span className="text-gray-900 font-bold text-[15px]">{formatPrice(salePrice!)}</span>
        <span className="text-red-400 line-through text-xs bg-red-50 px-1.5 py-0.5 rounded">
          {formatPrice(price)}
        </span>
      </div>
    );
  }

  return (
    <span className={`text-card-foreground font-bold text-[15px] ${className}`}>
      {formatPrice(price)}
    </span>
  );
}