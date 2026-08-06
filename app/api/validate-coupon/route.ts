import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { checkCoupon } from '@/lib/coupons';

// Valida un código de descuento cuando el cliente lo teclea en el carrito
// o checkout. La validación definitiva se repite en /api/checkout al
// cobrar — esta solo es para dar feedback inmediato en la UI.
export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };

  const supabase = createServiceRoleClient();
  const result = await checkCoupon(supabase, code);

  if (!result.valid) {
    return NextResponse.json({
      valid: false,
      message: result.reason === 'already_used' ? 'Este código ya fue utilizado.' : 'Código no válido.',
    });
  }

  return NextResponse.json({ valid: true, code: result.code, percent: result.percent });
}
