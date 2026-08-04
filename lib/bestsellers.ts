import { createClient } from './supabase/server';
import type { Product } from './types';

// Productos ordenados por ventas reales (sumando order_items de órdenes
// no canceladas). Si no hay suficiente historial para llenar `limit`,
// rellena con el resto de productos (más recientes primero) para que las
// secciones que dependen de esto (home "Más vendidos", "Recomendados" del
// carrito) no se vean vacías mientras la tienda es nueva — pero los que
// sí tienen ventas reales siempre aparecen primero.
export async function getBestsellers(
  supabase: ReturnType<typeof createClient>,
  limit = 12,
  excludeSlug?: string
): Promise<Product[]> {
  const { data: items } = await supabase
    .from('order_items')
    .select('qty, product_id, order:orders(status)');

  const unitsByProduct = new Map<string, number>();
  for (const item of (items ?? []) as unknown as { qty: number; product_id: string; order: { status: string } | null }[]) {
    if (item.order?.status === 'cancelled') continue;
    unitsByProduct.set(item.product_id, (unitsByProduct.get(item.product_id) ?? 0) + item.qty);
  }

  const rankedIds = [...unitsByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  let query = supabase.from('products').select('*, variants:product_variants(*)').order('created_at', { ascending: false });
  if (excludeSlug) query = query.neq('slug', excludeSlug);
  const { data: allProducts } = await query;

  const byId = new Map((allProducts ?? []).map((p) => [p.id, p as Product]));

  const sold = rankedIds.map((id) => byId.get(id)).filter(Boolean) as Product[];
  const soldIds = new Set(sold.map((p) => p.id));
  const rest = (allProducts ?? []).filter((p) => !soldIds.has(p.id)) as Product[];

  return [...sold, ...rest].slice(0, limit);
}
