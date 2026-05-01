interface PriceDisplayProps {
  price: number;
  salePrice?: number | null;
  className?: string;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function PriceDisplay({ price, salePrice, className = "" }: PriceDisplayProps) {
  const hasSale = salePrice !== null && salePrice !== undefined && salePrice < price;

  if (hasSale) {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <span className="text-primary font-semibold">{formatPrice(salePrice!)}</span>
        <span className="text-muted-foreground line-through text-sm">{formatPrice(price)}</span>
      </div>
    );
  }

  return (
    <span className={`text-primary font-semibold ${className}`}>
      {formatPrice(price)}
    </span>
  );
}
