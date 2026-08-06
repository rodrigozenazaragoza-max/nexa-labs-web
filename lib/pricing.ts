import type { SupabaseClient } from '@supabase/supabase-js';
import type { CartItem } from './types';

// Re-cotización del carrito EN EL SERVIDOR.
//
// POR QUÉ EXISTE: el navegador manda el carrito completo (producto,
// variante, precio) en el cuerpo del POST a /api/checkout. Confiar en ese
// precio significa que cualquiera puede abrir las herramientas de
// desarrollador, cambiar `price_mxn` a 1 y llevarse un vial de $2,000 por
// un peso. Aquí se ignoran por completo los precios que llegan del cliente
// y se vuelven a leer de la base de datos usando SOLO los IDs.
//
// De paso valida existencias, para no cobrarle a alguien algo que ya se
// agotó entre que lo agregó al carrito y le dio pagar.

export type PricedLine = {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  qty: number;
  unitPriceMxn: number;
};

export type PricingResult =
  | { ok: true; lines: PricedLine[]; subtotal: number }
  | { ok: false; error: string };

export async function repriceCart(
  supabase: SupabaseClient,
  items: CartItem[]
): Promise<PricingResult> {
  if (!items?.length) return { ok: false, error: 'El carrito está vacío.' };

  const productIds = [...new Set(items.map((i) => i.product?.id).filter(Boolean))] as string[];
  if (productIds.length === 0) return { ok: false, error: 'El carrito no es válido.' };

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price_mxn, stock, variants:product_variants(id, label, price_mxn, stock)')
    .in('id', productIds);

  if (error) {
    console.error(error);
    return { ok: false, error: 'No se pudo verificar el carrito. Intenta de nuevo.' };
  }

  const byId = new Map((products ?? []).map((p: any) => [p.id, p]));
  const lines: PricedLine[] = [];

  for (const item of items) {
    const qty = Math.floor(Number(item.qty));
    if (!Number.isFinite(qty) || qty < 1) {
      return { ok: false, error: 'Hay una cantidad inválida en tu carrito.' };
    }

    const product = byId.get(item.product?.id);
    if (!product) {
      return { ok: false, error: 'Uno de los productos de tu carrito ya no está disponible.' };
    }

    // Si el renglón dice tener presentación, tiene que ser una presentación
    // REAL de ESE producto — no basta con que el id exista.
    if (item.variant?.id) {
      const variant = (product.variants ?? []).find((v: any) => v.id === item.variant!.id);
      if (!variant) {
        return { ok: false, error: `La presentación elegida de ${product.name} ya no está disponible.` };
      }
      if (variant.stock < qty) {
        return {
          ok: false,
          error: `Solo quedan ${variant.stock} unidades de ${product.name} ${variant.label}. Ajusta la cantidad.`,
        };
      }
      lines.push({
        productId: product.id,
        variantId: variant.id,
        variantLabel: variant.label,
        name: `${product.name} — ${variant.label}`,
        qty,
        unitPriceMxn: Number(variant.price_mxn),
      });
      continue;
    }

    if (product.stock < qty) {
      return {
        ok: false,
        error: `Solo quedan ${product.stock} unidades de ${product.name}. Ajusta la cantidad.`,
      };
    }
    lines.push({
      productId: product.id,
      variantId: null,
      variantLabel: null,
      name: product.name,
      qty,
      unitPriceMxn: Number(product.price_mxn),
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitPriceMxn * l.qty, 0);
  return { ok: true, lines, subtotal };
}
