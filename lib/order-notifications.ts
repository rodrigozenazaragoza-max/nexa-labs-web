// Dispara el correo de confirmación de pedido cuando una orden pasa a
// "paid" — se llama tanto desde el checkout (pago aprobado al instante) como
// desde el webhook de Ecart Pay (confirmación asíncrona), así que usa la
// columna confirmation_email_sent_at para no mandar el correo dos veces.
//
// Nunca truena el flujo de checkout/webhook si el correo falla — solo se
// registra el error en consola. Un correo perdido no debe bloquear un pago
// que ya se cobró correctamente.

import type { SupabaseClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail, isEmailConfigured } from './email';

export async function maybeSendOrderConfirmationEmail(supabase: SupabaseClient, orderId: string): Promise<void> {
  if (!isEmailConfigured()) return;

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status, total_mxn, discount_mxn, shipping_mxn, customer_name, customer_email, shipping_address, confirmation_email_sent_at')
      .eq('id', orderId)
      .single();

    if (orderError || !order) return;
    if (order.status !== 'paid') return;
    if (order.confirmation_email_sent_at) return; // ya se mandó

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('qty, unit_price_mxn, variant_label, product:products(name)')
      .eq('order_id', orderId);

    if (itemsError || !items) return;

    await sendOrderConfirmationEmail({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      totalMxn: Number(order.total_mxn),
      discountMxn: Number(order.discount_mxn ?? 0),
      shippingMxn: Number(order.shipping_mxn ?? 0),
      shippingAddress: order.shipping_address,
      items: items.map((i: any) => ({
        name: i.product?.name || 'Producto',
        variantLabel: i.variant_label,
        qty: i.qty,
        unitPriceMxn: Number(i.unit_price_mxn),
      })),
    });

    await supabase.from('orders').update({ confirmation_email_sent_at: new Date().toISOString() }).eq('id', orderId);
  } catch (err) {
    console.error('No se pudo enviar el correo de confirmación de pedido:', err);
  }
}
