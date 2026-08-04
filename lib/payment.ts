// Abstracción de pasarela de pago.
//
// Por qué existe este archivo: Stripe, PayPal y Shopify Payments no aceptan
// la categoría "research peptides" — necesitas un gateway de alto riesgo
// (ej. Monelo, que ya usa un competidor directo: exomapeptides.mx).
// Mantener esta lógica en un solo lugar significa que puedes cambiar de
// proveedor sin tocar el checkout ni el resto de la app.

export type PaymentIntentResult = {
  provider: 'monelo' | 'mock';
  redirectUrl?: string;
  clientSecret?: string;
};

export async function createPaymentIntent(
  orderId: string,
  amountMxn: number
): Promise<PaymentIntentResult> {
  const apiKey = process.env.MONELO_SECRET_KEY;

  if (!apiKey) {
    // Modo mock: no hay gateway configurado todavía.
    // Útil para probar el flujo de checkout end-to-end antes de tener
    // una cuenta aprobada con un procesador de pagos.
    return {
      provider: 'mock',
      redirectUrl: `/checkout/success?order=${orderId}&mock=1`,
    };
  }

  // TODO: implementar la llamada real a la API de Monelo una vez que tengas
  // credenciales y su documentación de /desarrolladores. Estructura típica:
  //
  // const res = await fetch('https://api.monelo.mx/v1/payment-intents', {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${apiKey}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ amount: amountMxn, currency: 'MXN', reference: orderId }),
  // });
  // const data = await res.json();
  // return { provider: 'monelo', redirectUrl: data.checkout_url };

  throw new Error(
    'Falta implementar la integración real de Monelo — revisa README.md sección "Pagos".'
  );
}
