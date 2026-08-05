import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { chargeWithEcartPay } from '@/lib/payment';
import { siteConfig } from '@/lib/site-config';
import { itemUnitPrice } from '@/lib/cart-utils';
import { maybeSendOrderConfirmationEmail } from '@/lib/order-notifications';
import type { CartItem, CheckoutCustomer } from '@/lib/types';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    items: CartItem[];
    customer: CheckoutCustomer;
    couponCode?: string | null;
    cardToken?: string;
  };
  const { items, customer, couponCode, cardToken } = body;

  if (!items?.length) {
    return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
  }
  if (!customer?.confirmsResearchUse || !customer?.confirmsAge) {
    return NextResponse.json(
      { error: 'Debes confirmar uso de investigación y mayoría de edad.' },
      { status: 400 }
    );
  }

  const subtotal = items.reduce((sum, i) => sum + itemUnitPrice(i) * i.qty, 0);

  // Recalcula el descuento en el servidor — nunca confíes en el total que
  // manda el cliente. Si más adelante quieres múltiples cupones, cambia
  // esto por una tabla `coupons` en Supabase en vez de un solo código fijo.
  const couponValid = couponCode && couponCode.toUpperCase() === siteConfig.newsletter.discountCode;
  const discount = couponValid ? subtotal * (siteConfig.newsletter.discountPercent / 100) : 0;
  const total = subtotal - discount;

  const supabase = createServiceRoleClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      status: 'pending',
      total_mxn: total,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      shipping_address: customer.address,
      confirms_research_use: customer.confirmsResearchUse,
      confirms_age: customer.confirmsAge,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error(orderError);
    return NextResponse.json({ error: 'No se pudo crear la orden.' }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      variant_id: i.variant?.id ?? null,
      variant_label: i.variant?.label ?? null,
      qty: i.qty,
      unit_price_mxn: itemUnitPrice(i),
    }))
  );

  if (itemsError) {
    console.error(itemsError);
    return NextResponse.json({ error: 'No se pudieron guardar los productos de la orden.' }, { status: 500 });
  }

  const [firstName, ...rest] = customer.name.trim().split(' ');
  const lastName = rest.join(' ') || '-';

  let payment;
  try {
    payment = await chargeWithEcartPay(order.id, order.order_number, {
      cardToken: cardToken || '',
      email: customer.email,
      firstName: firstName || customer.name,
      lastName,
      phone: customer.phone,
      currency: 'MXN',
      reference: `Pedido ${order.order_number}`,
      // Ecart Pay rechaza líneas con price <= 0 ("items[0].price must be
      // greater than 0") — filtramos artículos gratis/de regalo (ej. agua
      // bacteriostática de cortesía) del cobro. Siguen guardados en
      // order_items para el envío, solo no se le cobran al cliente.
      items: items
        .filter((i) => itemUnitPrice(i) > 0)
        .map((i) => ({
          name: i.product.name + (i.variant ? ` — ${i.variant.label}` : ''),
          price: itemUnitPrice(i),
          quantity: i.qty,
        })),
      shippingAddress: {
        address1: customer.street || customer.address,
        city: customer.city || '',
        state: customer.state || '',
        postal_code: customer.postalCode || '',
        first_name: firstName || customer.name,
        last_name: lastName,
        phone: customer.phone,
      },
    });
  } catch (err: any) {
    console.error(err);
    // El pedido ya quedó guardado como "pending" en Supabase (no se pierde);
    // solo informamos que el cobro falló para que el cliente pueda reintentar.
    return NextResponse.json({ error: err.message || 'No se pudo procesar el pago.' }, { status: 502 });
  }

  const updates: Record<string, unknown> = {};
  if (payment.ecartpayOrderId) updates.ecartpay_order_id = payment.ecartpayOrderId;
  if (payment.status) updates.ecartpay_status = payment.status;
  if (payment.provider === 'ecartpay' && payment.status && ['paid', 'approved', 'completed'].includes(payment.status.toLowerCase())) {
    updates.status = 'paid';
  }
  if (Object.keys(updates).length) {
    await supabase.from('orders').update(updates).eq('id', order.id);
  }

  if (updates.status === 'paid') {
    await maybeSendOrderConfirmationEmail(supabase, order.id);
  }

  return NextResponse.json({ orderId: order.id, orderNumber: order.order_number, payment });
}
