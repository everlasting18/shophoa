export function hasSale(price: number, salePrice?: number | null): boolean {
  return salePrice !== null && salePrice !== undefined && salePrice < price;
}

export function getDisplayPrice(price: number, salePrice?: number | null): number {
  return salePrice !== null && salePrice !== undefined && salePrice < price ? salePrice : price;
}
