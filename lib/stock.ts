import type { SupabaseClient } from '@supabase/supabase-js';

// Descuenta el inventario de un pedido pagado.
//
// La resta ocurre dentro de la función apply_order_stock() de Postgres, que
// bloquea la fila del pedido antes de tocar nada. Eso la vuelve:
//  · atómica — o se descuenta todo el pedido, o nada;
//  · idempotente — el checkout y el webhook pueden llamarla los dos (pasa
//    seguido) y el inventario solo baja una vez, gracias a la bandera
//    orders.stock_applied.
//
// Nunca lanza excepción: si algo falla, se registra en consola pero NO se
// tumba la respuesta al cliente — su pago ya se procesó y su pedido existe.
// Un inventario desfasado se corrige desde el panel; un error 500 después
// de cobrar, no.
export async function applyOrderStock(supabase: SupabaseClient, orderId: string): Promise<void> {
  const { error } = await supabase.rpc('apply_order_stock', { p_order_id: orderId });
  if (error) {
    console.error(`No se pudo descontar inventario del pedido ${orderId}:`, error);
  }
}
