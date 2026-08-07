import { cache } from 'react';
import { createPublicClient } from './supabase/server';
import { siteConfig } from './site-config';
import type { Product } from './types';

// Capa de datos con memoización por petición (React cache()).
//
// PROBLEMA QUE RESUELVE: antes, cada navegación disparaba la MISMA consulta
// varias veces. El home, por ejemplo, leía la tabla `products` completa tres
// veces: una en el layout (para el pool de recomendados del carrito), otra en
// getBestsellers de la página, y otra para las tabs de categorías. Con
// cache(), la primera llamada hace el viaje a Supabase y las demás reciben
// ese mismo resultado — sin cambiar nada de la lógica de negocio.
//
// cache() memoriza SOLO dentro de una misma petición: dos visitantes
// distintos, o dos recargas, siguen viendo datos frescos. No hay riesgo de
// servir precios o stock viejos.

// Todos los productos con sus presentaciones. Es la consulta más pesada del
// sitio (42 productos + 84 variantes ≈ 177 kB) y se reutiliza en casi todas
// las páginas — por eso es la que más gana con memoizarse.
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .order('created_at', { ascending: false });
  return (data ?? []) as Product[];
});

// Unidades vendidas por producto, para ordenar "Más Vendidos" y el pool de
// recomendados del carrito.
export const getUnitsSoldByProduct = cache(async (): Promise<Map<string, number>> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from('order_items').select('qty, product_id, order:orders(status)');

  const units = new Map<string, number>();
  for (const item of (data ?? []) as unknown as {
    qty: number;
    product_id: string;
    order: { status: string } | null;
  }[]) {
    if (item.order?.status === 'cancelled') continue;
    units.set(item.product_id, (units.get(item.product_id) ?? 0) + item.qty);
  }
  return units;
});

// Configuración del sitio (número de WhatsApp y mensaje por defecto).
export const getSettings = cache(async () => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('settings')
    .select('whatsapp_number, whatsapp_message')
    .eq('id', 1)
    .maybeSingle();

  return {
    whatsappNumber: data?.whatsapp_number || '526221193067',
    whatsappMessage: data?.whatsapp_message || 'Hola, tengo una pregunta sobre sus productos.',
  };
});

// El diluyente (agua bacteriostática) que se ofrece como recordatorio en el
// carrito. Sale del mismo listado ya memoizado — cero consultas extra.
export const getDiluentProduct = cache(async (): Promise<Product | null> => {
  const products = await getAllProducts();
  return products.find((p) => p.slug === siteConfig.diluent.slug) ?? null;
});

// Productos ordenados por ventas reales. Si no hay historial suficiente,
// rellena con el resto (más recientes primero) para que las secciones no se
// vean vacías mientras la tienda es nueva.
export async function getBestsellersCached(limit = 12, excludeSlug?: string): Promise<Product[]> {
  const [all, units] = await Promise.all([getAllProducts(), getUnitsSoldByProduct()]);

  const pool = excludeSlug ? all.filter((p) => p.slug !== excludeSlug) : all;
  const byId = new Map(pool.map((p) => [p.id, p]));

  const sold = [...units.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => byId.get(id))
    .filter(Boolean) as Product[];

  const soldIds = new Set(sold.map((p) => p.id));
  const rest = pool.filter((p) => !soldIds.has(p.id));

  return [...sold, ...rest].slice(0, limit);
}
