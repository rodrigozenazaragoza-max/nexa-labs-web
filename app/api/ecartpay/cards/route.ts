import { NextResponse } from 'next/server';
import { listEcartCustomerCards, isEcartPayConfigured } from '@/lib/ecartpay';

// Regresa las tarjetas ya guardadas de un cliente en Ecart Pay, para
// mostrarlas directo en el checkout (clientes que ya compraron antes no
// tienen que volver a capturar su tarjeta cada vez).
export async function GET(req: Request) {
  if (!isEcartPayConfigured()) {
    return NextResponse.json({ cards: [] });
  }
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');
  if (!customerId) {
    return NextResponse.json({ error: 'Falta el identificador del cliente.' }, { status: 400 });
  }
  try {
    const cards = await listEcartCustomerCards(customerId);
    return NextResponse.json({ cards });
  } catch (err: any) {
    console.error(err);
    // No bloqueamos el checkout si esto falla — el cliente simplemente no
    // verá tarjetas guardadas y podrá agregar una nueva normalmente.
    return NextResponse.json({ cards: [] });
  }
}
