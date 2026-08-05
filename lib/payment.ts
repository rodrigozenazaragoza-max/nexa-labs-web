// Abstracción de pasarela de pago — procesador: Ecart Pay.
//
// Ver lib/ecartpay.ts para el detalle de la integración (autenticación,
// tokenización de tarjeta, creación de orden) y docs.ecartpay.com para la
// referencia completa de la API.
//
// Modo mock: si ECARTPAY_PUBLIC_KEY / ECARTPAY_SECRET_KEY no están
// configuradas en el entorno, el checkout sigue funcionando pero sin cobrar
// de verdad — útil para probar el flujo completo antes de tener llaves.

import { createEcartOrder, isEcartPayConfigured, type CreateEcartOrderInput } from './ecartpay';

export type PaymentIntentResult = {
  provider: 'ecartpay' | 'mock';
  redirectUrl?: string;
  status?: string;
  ecartpayOrderId?: string;
};

export async function chargeWithEcartPay(
  orderId: string,
  orderNumber: string,
  input: Omit<CreateEcartOrderInput, 'referenceId' | 'notifyUrl'>
): Promise<PaymentIntentResult> {
  if (!isEcartPayConfigured()) {
    // Sin credenciales todavía: dejamos pasar el pedido en modo prueba para
    // no bloquear el desarrollo del resto del sitio.
    return { provider: 'mock', redirectUrl: `/checkout/success?order=${orderNumber}&mock=1` };
  }

  if (!input.cardToken) {
    throw new Error('Falta el token de la tarjeta — agrega una tarjeta antes de confirmar el pedido.');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexa-labs-peptides.netlify.app';

  const result = await createEcartOrder({
    ...input,
    referenceId: orderId,
    notifyUrl: `${siteUrl}/api/webhook`,
  });

  return {
    provider: 'ecartpay',
    status: result.status,
    ecartpayOrderId: result.id,
    redirectUrl: `/checkout/success?order=${orderNumber}`,
  };
}
