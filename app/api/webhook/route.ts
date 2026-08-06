import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { maybeSendOrderConfirmationEmail } from '@/lib/order-notifications';
import { markOrderCouponUsed } from '@/lib/coupons';
import { applyOrderStock } from '@/lib/stock';

// Webhook de Ecart Pay: nos avisa cuando el estado de un pago cambia
// (aprobado, rechazado, etc.). Ver docs.ecartpay.com/docs/webhooks-in-ecart-pay
//
// Buscamos el pedido primero por el ID de orden que nos dio Ecart Pay
// (guardado al crear el cargo) y, si no lo encontramos, por reference_id
// (que es el ID de nuestro propio pedido en Supabase).
export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const ecartOrderId: string | undefined = payload.id || payload.order_id || payload.orderId;
  const referenceId: string | undefined = payload.reference_id || payload.referenceId;
  const status: string | undefined = payload.status;

  if (!ecartOrderId && !referenceId) {
    return NextResponse.json({ error: 'No se pudo identificar el pedido en el webhook.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  let query = supabase.from('orders').select('id, status').limit(1);
  query = ecartOrderId ? query.eq('ecartpay_order_id', ecartOrderId) : query.eq('id', referenceId as string);
  const { data: existing } = await query.maybeSingle();

  // Si todavía no teníamos guardado el ecartpay_order_id (por ejemplo, la
  // primera notificación llega antes de que terminemos de guardar la orden),
  // intentamos de nuevo por reference_id.
  const orderRow =
    existing ?? (referenceId ? (await supabase.from('orders').select('id, status').eq('id', referenceId).maybeSingle()).data : null);

  if (!orderRow) {
    console.error('Webhook de Ecart Pay: pedido no encontrado', { ecartOrderId, referenceId });
    return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
  }

  const normalizedStatus = (status || '').toLowerCase();
  const mappedStatus = ['paid', 'approved', 'completed', 'success'].includes(normalizedStatus)
    ? 'paid'
    : ['rejected', 'failed', 'cancelled', 'canceled'].includes(normalizedStatus)
      ? 'cancelled'
      : orderRow.status;

  const { error } = await supabase
    .from('orders')
    .update({
      status: mappedStatus,
      ecartpay_status: status ?? null,
      ecartpay_order_id: ecartOrderId ?? undefined,
    })
    .eq('id', orderRow.id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo actualizar la orden.' }, { status: 500 });
  }

  if (mappedStatus === 'paid') {
    // Quema el código de descuento y descuenta inventario (ambas
    // idempotentes — si el checkout ya lo hizo, esto no repite nada).
    await markOrderCouponUsed(supabase, orderRow.id);
    await applyOrderStock(supabase, orderRow.id);
    await maybeSendOrderConfirmationEmail(supabase, orderRow.id);
  }

  return NextResponse.json({ ok: true });
}
