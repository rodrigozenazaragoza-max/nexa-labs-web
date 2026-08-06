import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { chargeWithEcartPay } from '@/lib/payment';
import { checkCoupon, markOrderCouponUsed } from '@/lib/coupons';
import { repriceCart } from '@/lib/pricing';
import { shippingCostFor } from '@/lib/shipping';
import { applyOrderStock } from '@/lib/stock';
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

  const supabase = createServiceRoleClient();

  // SEGURIDAD: se ignoran por completo los precios que vienen del navegador
  // y se vuelven a leer de la base de datos usando solo los IDs. Sin esto,
  // cualquiera podría editar el carrito en las herramientas de desarrollador
  // y pagar $1 por un vial de $2,000. De paso valida existencias.
  const priced = await repriceCart(supabase, items);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }
  const subtotal = priced.subtotal;

  // Recalcula el descuento en el servidor — nunca confíes en el total que
  // manda el cliente. checkCoupon valida tanto los códigos únicos de un
  // solo uso (tabla discount_codes) como el código compartido legacy.
  const coupon = couponCode ? await checkCoupon(supabase, couponCode) : null;
  if (couponCode && coupon && !coupon.valid) {
    return NextResponse.json(
      {
        error:
          coupon.reason === 'already_used'
            ? 'El código de descuento ya fue utilizado. Quítalo e intenta de nuevo.'
            : 'El código de descuento no es válido. Quítalo e intenta de nuevo.',
      },
      { status: 400 }
    );
  }
  // ---------------------------------------------------------------------
  // Monto a cobrar.
  //
  // IMPORTANTE: Ecart Pay calcula el cargo sumando los renglones que le
  // mandamos — no acepta un "total" aparte. Por eso el descuento se aplica
  // BAJANDO el precio unitario de cada renglón, y el envío viaja como un
  // renglón más. Si no, el cliente vería un total con descuento en pantalla
  // y su tarjeta recibiría el cargo completo.
  //
  // El total que guardamos se deriva de esos mismos renglones ya redondeados,
  // así lo que dice la base de datos y lo que cobra la pasarela coinciden
  // siempre al centavo.
  // ---------------------------------------------------------------------
  const discountPct = coupon?.valid ? coupon.percent : 0;
  const round2 = (n: number) => Math.round(n * 100) / 100;

  const chargeLines = priced.lines.map((l) => ({
    ...l,
    chargedUnitPrice: round2(l.unitPriceMxn * (1 - discountPct / 100)),
  }));

  const merchandiseCharged = chargeLines.reduce((sum, l) => sum + l.chargedUnitPrice * l.qty, 0);
  const discount = round2(subtotal - merchandiseCharged);

  // Envío con la misma regla que ve el cliente (lib/shipping.ts): gratis a
  // partir del umbral, tarifa fija abajo. Se evalúa sobre el subtotal de
  // mercancía antes del descuento.
  const shipping = shippingCostFor(subtotal);
  const total = round2(merchandiseCharged + shipping);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      status: 'pending',
      total_mxn: total,
      coupon_code: coupon?.valid ? coupon.code : null,
      discount_mxn: discount,
      shipping_mxn: shipping,
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

  // Se guardan los renglones YA re-cotizados contra la base de datos, no lo
  // que mandó el navegador.
  const { error: itemsError } = await supabase.from('order_items').insert(
    priced.lines.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      variant_id: l.variantId,
      variant_label: l.variantLabel,
      qty: l.qty,
      unit_price_mxn: l.unitPriceMxn,
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
      // Precios YA con el descuento aplicado, más el envío como un renglón
      // extra — es la única forma de que Ecart Pay cobre exactamente el
      // total que el cliente vio en pantalla.
      items: [
        ...chargeLines
          .filter((l) => l.chargedUnitPrice > 0)
          .map((l) => ({ name: l.name, price: l.chargedUnitPrice, quantity: l.qty })),
        ...(shipping > 0 ? [{ name: 'Envío', price: shipping, quantity: 1 }] : []),
      ],
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
    // Quema el código de descuento único (si el pedido usó uno) y descuenta
    // el inventario. Ambas son idempotentes: el webhook de Ecart Pay las
    // vuelve a llamar y no pasa nada.
    await markOrderCouponUsed(supabase, order.id);
    await applyOrderStock(supabase, order.id);
    await maybeSendOrderConfirmationEmail(supabase, order.id);
  }

  return NextResponse.json({ orderId: order.id, orderNumber: order.order_number, payment });
}
