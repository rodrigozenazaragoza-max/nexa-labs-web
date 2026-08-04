import type { CartItem, Product, ProductVariant } from './types';

export function lineKey(product: Product, variant: ProductVariant | null) {
  return variant ? `${product.id}:${variant.id}` : product.id;
}

export function itemUnitPrice(item: CartItem) {
  return item.variant ? item.variant.price_mxn : item.product.price_mxn;
}

export function itemStock(item: CartItem) {
  return item.variant ? item.variant.stock : item.product.stock;
}

export function itemLabel(item: CartItem) {
  return item.variant ? `${item.product.name} — ${item.variant.label}` : item.product.name;
}

export function itemImage(item: CartItem) {
  return item.variant?.image_url ?? item.product.image_url ?? null;
}
