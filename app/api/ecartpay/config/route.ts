import { NextResponse } from 'next/server';
import { ecartpaySdkUrl, isEcartPayConfigured } from '@/lib/ecartpay';

// Le dice al checkout qué script de Ecart Pay cargar (sandbox o producción)
// y si el pago con tarjeta está disponible en este momento.
export async function GET() {
  return NextResponse.json({ sdkUrl: ecartpaySdkUrl, configured: isEcartPayConfigured() });
}
