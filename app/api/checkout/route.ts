import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createPaymentIntent } from '@/lib/payment';
import { siteConfig } from '@/lib/site-config';
import { itemUnitPrice } from '@/lib/cart-utils';
import type { CartItem, CheckoutCustomer } from '@/lib/types';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    items: CartItem[];
    customer: CheckoutCustomer;
    couponCode?: string | null;
  };
  const { items, customer, couponCode } = body;

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

  const payment = await createPaymentIntent(order.order_number, total);
  return NextResponse.json({ orderId: order.id, orderNumber: order.order_number, payment });
}
