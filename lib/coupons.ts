import type { SupabaseClient } from '@supabase/supabase-js';
import { siteConfig } from '@/lib/site-config';

// Lógica de cupones compartida entre /api/validate-coupon (lo que ve el
// cliente al teclear su código) y /api/checkout (la validación REAL al
// cobrar — nunca confiamos en lo que diga el navegador).
//
// Dos tipos de código conviven:
// 1. Códigos únicos de un solo uso (tabla discount_codes) — ej. NEXA10-K3F9QZ,
//    generados al suscribirse al newsletter. Al pagarse el pedido se marcan
//    como usados y no funcionan de nuevo.
// 2. El código legacy compartido (BIENVENIDO10, siteConfig) — sigue vivo por
//    si ya se repartió. Para matarlo, cambia `legacyEnabled` a false.
const LEGACY_ENABLED = true;

export type CouponCheck =
  | { valid: true; code: string; percent: number; unique: boolean }
  | { valid: false; reason: 'not_found' | 'already_used' };

export async function checkCoupon(supabase: SupabaseClient, raw: string | null | undefined): Promise<CouponCheck> {
  const code = (raw ?? '').trim().toUpperCase();
  if (!code) return { valid: false, reason: 'not_found' };

  const { data } = await supabase
    .from('discount_codes')
    .select('code, percent, used')
    .eq('code', code)
    .maybeSingle();

  if (data) {
    if (data.used) return { valid: false, reason: 'already_used' };
    return { valid: true, code, percent: data.percent, unique: true };
  }

  if (LEGACY_ENABLED && code === siteConfig.newsletter.discountCode.toUpperCase()) {
    return { valid: true, code, percent: siteConfig.newsletter.discountPercent, unique: false };
  }

  return { valid: false, reason: 'not_found' };
}

// Marca como usado el código único de un pedido pagado. Idempotente: si el
// webhook y el checkout lo llaman los dos, el segundo no hace nada
// (eq('used', false)). El código legacy no está en la tabla, así que
// simplemente no matchea y queda multiuso.
export async function markOrderCouponUsed(supabase: SupabaseClient, orderId: string): Promise<void> {
  const { data: order } = await supabase
    .from('orders')
    .select('coupon_code, order_number')
    .eq('id', orderId)
    .maybeSingle();

  if (!order?.coupon_code) return;

  await supabase
    .from('discount_codes')
    .update({ used: true, used_at: new Date().toISOString(), used_order_number: order.order_number })
    .eq('code', order.coupon_code)
    .eq('used', false);
}
