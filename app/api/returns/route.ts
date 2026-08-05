import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

const VALID_REASONS = [
  'Producto dañado en envío',
  'Producto incorrecto',
  'Problema de calidad',
  'Ya no lo necesito',
  'Otro motivo',
];

export async function POST(req: Request) {
  const body = (await req.json()) as {
    orderNumber?: string;
    email?: string;
    name?: string;
    reason?: string;
    details?: string;
  };
  const orderNumber = body.orderNumber?.trim();
  const email = body.email?.trim();
  const name = body.name?.trim();
  const reason = body.reason?.trim();
  const details = body.details?.trim() || null;

  if (!orderNumber || !email || !name || !reason) {
    return NextResponse.json({ error: 'Completa número de pedido, nombre, correo y motivo.' }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: 'Motivo de devolución no válido.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, order_number, customer_email')
    .ilike('order_number', orderNumber)
    .ilike('customer_email', email)
    .maybeSingle();

  if (findError) {
    console.error(findError);
    return NextResponse.json({ error: 'No se pudo validar el pedido.' }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json(
      { error: 'No encontramos un pedido con ese número y correo. Verifica que coincidan con tu confirmación de compra.' },
      { status: 404 }
    );
  }

  const { error: insertError } = await supabase.from('returns').insert({
    order_id: order.id,
    order_number: order.order_number,
    customer_name: name,
    customer_email: email,
    reason,
    details,
  });

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ error: 'No se pudo registrar tu solicitud. Intenta de nuevo.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
