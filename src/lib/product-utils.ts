export function hasSale(price: number, salePrice?: number | null): boolean {
  return typeof salePrice === 'number' && salePrice > 0 && salePrice < price;
}

export function getDisplayPrice(price: number, salePrice?: number | null): number {
  return typeof salePrice === 'number' && salePrice > 0 && salePrice < price ? salePrice : price;
}
