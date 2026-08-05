import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente de pago',
  paid: 'Pagado — en preparación',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
};

export async function POST(req: Request) {
  const { orderNumber, email } = (await req.json()) as { orderNumber?: string; email?: string };

  if (!orderNumber?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Ingresa tu número de pedido y correo.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, status, total_mxn, customer_email, customer_name, created_at, tracking_carrier, tracking_number, tracking_url, shipped_at')
    .ilike('order_number', orderNumber.trim())
    .ilike('customer_email', email.trim())
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo consultar el pedido.' }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json(
      { error: 'No encontramos un pedido con ese número y correo. Verifica que ambos coincidan exactamente con tu confirmación de compra.' },
      { status: 404 }
    );
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('qty, variant_label, unit_price_mxn, products(name)')
    .eq('order_id', order.id);

  return NextResponse.json({
    orderNumber: order.order_number,
    statusLabel: STATUS_LABELS[order.status] ?? order.status,
    createdAt: order.created_at,
    totalMxn: order.total_mxn,
    trackingCarrier: order.tracking_carrier,
    trackingNumber: order.tracking_number,
    trackingUrl: order.tracking_url,
    shippedAt: order.shipped_at,
    items: (items ?? []).map((i: any) => ({
      name: i.products?.name ?? 'Producto',
      variantLabel: i.variant_label,
      qty: i.qty,
    })),
  });
}
