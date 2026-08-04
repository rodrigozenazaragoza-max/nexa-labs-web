import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Placeholder de webhook para cuando el gateway de pago confirme un cobro.
// Cuando tengas Monelo (u otro) configurado: valida la firma del webhook
// con MONELO_WEBHOOK_SECRET antes de marcar la orden como pagada.
export async function POST(req: Request) {
  const payload = await req.json();

  // TODO: verificar firma/autenticidad del webhook antes de confiar en payload.
  const orderId = payload.orderId as string | undefined;
  if (!orderId) {
    return NextResponse.json({ error: 'orderId faltante' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
  if (error) {
    return NextResponse.json({ error: 'No se pudo actualizar la orden.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
