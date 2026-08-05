import { NextResponse } from 'next/server';
import { findOrCreateEcartCustomer, createEcartCustomerSession, isEcartPayConfigured } from '@/lib/ecartpay';

// Crea un cliente + sesión en Ecart Pay para poder abrir el formulario de
// captura de tarjeta desde el navegador. Se llama justo antes de mostrar el
// botón "Agregar tarjeta" en el checkout.
export async function POST(req: Request) {
  if (!isEcartPayConfigured()) {
    return NextResponse.json({ error: 'Ecart Pay no está configurado todavía.' }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const { name, email, phone } = body as { name?: string; email?: string; phone?: string };
  if (!email) {
    return NextResponse.json({ error: 'Falta el correo del cliente.' }, { status: 400 });
  }
  try {
    const [firstName, ...rest] = (name || 'Cliente').trim().split(' ');
    const lastName = rest.join(' ') || '-';
    const customerId = await findOrCreateEcartCustomer({
      first_name: firstName || 'Cliente',
      last_name: lastName,
      email,
      phone: phone || '',
    });
    const session = await createEcartCustomerSession(customerId);
    return NextResponse.json({ customerId, session });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'No se pudo iniciar el pago.' }, { status: 500 });
  }
}
