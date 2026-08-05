import { NextResponse } from 'next/server';
import { tokenizeEcartCard, isEcartPayConfigured } from '@/lib/ecartpay';

// Convierte el identificador de tarjeta (que regresa el popup de Ecart Pay)
// en un token de cobro que podemos usar para crear la orden real.
export async function POST(req: Request) {
  if (!isEcartPayConfigured()) {
    return NextResponse.json({ error: 'Ecart Pay no está configurado todavía.' }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const { cardId } = body as { cardId?: string };
  if (!cardId) {
    return NextResponse.json({ error: 'Falta el identificador de la tarjeta.' }, { status: 400 });
  }
  try {
    const token = await tokenizeEcartCard(cardId);
    return NextResponse.json({ token });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'No se pudo procesar la tarjeta.' }, { status: 500 });
  }
}
