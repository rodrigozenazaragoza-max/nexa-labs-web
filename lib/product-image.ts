import type { Product } from './types';

// Devuelve la mejor imagen disponible para mostrar un producto: la de su
// primera presentación (por sort_order) si tiene variantes, o la del
// producto base si no. Si no hay ninguna imagen cargada, regresa null y
// los componentes muestran un placeholder en vez de romper.
export function productLeadImage(product: Product): string | null {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    const sorted = [...variants].sort((a, b) => a.sort_order - b.sort_order);
    const withImage = sorted.find((v) => v.image_url);
    if (withImage) return withImage.image_url;
  }
  return product.image_url;
}
