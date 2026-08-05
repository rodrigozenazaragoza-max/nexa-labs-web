// Integración con Ecart Pay (procesador de pagos de Nexa Labs)
// Documentación: https://docs.ecartpay.com
//
// Cómo funciona, en resumen:
// 1. En el checkout, el cliente hace clic en "Agregar tarjeta". Esto abre el
//    formulario oficial de Ecart Pay en un popup — los datos de la tarjeta
//    nunca tocan nuestro servidor (así reducimos el riesgo de seguridad).
// 2. Ecart Pay nos regresa un identificador de esa tarjeta guardada.
// 3. Lo convertimos en un "token" de cobro de un solo uso (endpoint /api/tokens).
// 4. Creamos la orden real en Ecart Pay con ese token — esto ejecuta el cobro.
// 5. Ecart Pay nos avisa el resultado por webhook (ver app/api/webhook/route.ts).
//
// Entornos: por default todo corre en Sandbox (pruebas, sin dinero real).
// Cuando el negocio esté listo para cobros reales, cambia la variable de
// entorno ECARTPAY_ENV a "production" en Netlify y reemplaza las API keys de
// sandbox por las de producción.

const ECARTPAY_ENV = process.env.ECARTPAY_ENV === 'production' ? 'production' : 'sandbox';

// La documentación pública de Ecart Pay solo confirma la URL de Sandbox
// (sandbox.ecartpay.com). Antes de activar producción, confirma con tu
// ejecutivo de cuenta (Diego Villarreal — diego.villarreal@ecart.com) cuál es
// la URL base de producción, y si es distinta, defínela en Netlify como
// ECARTPAY_API_BASE_URL para no tener que tocar código.
const DEFAULT_BASE_URL =
  ECARTPAY_ENV === 'production' ? 'https://api.ecartpay.com' : 'https://sandbox.ecartpay.com';

const BASE_URL = process.env.ECARTPAY_API_BASE_URL || DEFAULT_BASE_URL;

const PUBLIC_KEY = process.env.ECARTPAY_PUBLIC_KEY;
const SECRET_KEY = process.env.ECARTPAY_SECRET_KEY;

// URL del script SDK que captura los datos de la tarjeta en el navegador.
export const ecartpaySdkUrl =
  ECARTPAY_ENV === 'production' ? 'https://ecartpay.com/sdk/pay.js' : 'https://sandbox.ecartpay.com/sdk/pay.js';

export function isEcartPayConfigured() {
  return Boolean(PUBLIC_KEY && SECRET_KEY);
}

// El token de autorización de Ecart Pay dura 1 hora. Lo guardamos en memoria
// del proceso para no pedir uno nuevo en cada llamada.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  if (!PUBLIC_KEY || !SECRET_KEY) {
    throw new Error('Faltan ECARTPAY_PUBLIC_KEY / ECARTPAY_SECRET_KEY en las variables de entorno.');
  }
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }
  const basic = Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString('base64');
  const res = await fetch(`${BASE_URL}/api/authorizations/token`, {
    method: 'POST',
    headers: { authorization: `Basic ${basic}`, accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Ecart Pay: no se pudo generar el token de autorización (${res.status}).`);
  }
  const data = await res.json();
  // Válido 1 hora — lo damos por vencido 5 minutos antes por seguridad.
  cachedToken = { token: data.token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return data.token;
}

async function ecartFetch(path: string, init: RequestInit = {}) {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: token,
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.message || data?.error || `Error ${res.status} en ${path}`;
    throw new Error(`Ecart Pay: ${message}`);
  }
  return data;
}

export type EcartCustomerInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export async function createEcartCustomer(customer: EcartCustomerInput): Promise<string> {
  const data = await ecartFetch('/api/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
  const id = data?.id ?? data?._id;
  if (!id) throw new Error('Ecart Pay: respuesta inesperada al crear el cliente.');
  return id;
}

// Ecart Pay no permite dos clientes con el mismo correo/teléfono — si un
// cliente ya compró antes, hay que reutilizar su registro en vez de crear
// uno nuevo (eso es lo que fallaba: "email, phone or user_id already
// exists"). Buscamos primero por correo; si no existe, lo creamos.
export async function findOrCreateEcartCustomer(customer: EcartCustomerInput): Promise<string> {
  try {
    const existing = await ecartFetch(`/api/customers?email=${encodeURIComponent(customer.email)}`);
    const match = existing?.docs?.[0];
    if (match?.id) return match.id;
  } catch (err) {
    // Si la búsqueda falla por cualquier razón, seguimos e intentamos crear.
    console.error('Ecart Pay: no se pudo buscar cliente existente', err);
  }
  try {
    return await createEcartCustomer(customer);
  } catch (err: any) {
    // Carrera: alguien más lo creó entre la búsqueda y el intento de crear.
    if (String(err.message || '').toLowerCase().includes('already exists')) {
      const retry = await ecartFetch(`/api/customers?email=${encodeURIComponent(customer.email)}`);
      const match = retry?.docs?.[0];
      if (match?.id) return match.id;
    }
    throw err;
  }
}

export async function createEcartCustomerSession(customerId: string): Promise<string> {
  const data = await ecartFetch(`/api/customers/${customerId}/session`, { method: 'POST' });
  const session = data?.session ?? data?.id ?? data?.token;
  if (!session) throw new Error('Ecart Pay: respuesta inesperada al crear la sesión.');
  return session;
}

export async function tokenizeEcartCard(cardId: string): Promise<string> {
  const data = await ecartFetch('/api/tokens', {
    method: 'POST',
    body: JSON.stringify({ id: cardId, tokenization: true }),
  });
  if (!data?.token) throw new Error('Ecart Pay: respuesta inesperada al tokenizar la tarjeta.');
  return data.token;
}

export type EcartShippingAddress = {
  address1: string;
  city: string;
  state: string;
  postal_code: string;
  first_name: string;
  last_name: string;
  phone: string;
};

export type CreateEcartOrderInput = {
  cardToken: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  items: { name: string; price: number; quantity: number; discount?: number }[];
  currency?: string;
  notifyUrl: string;
  referenceId: string;
  reference?: string;
  shippingAddress: EcartShippingAddress;
};

export type EcartOrderResult = {
  id: string;
  status: string;
  pay_link?: string;
  [key: string]: unknown;
};

export async function createEcartOrder(input: CreateEcartOrderInput): Promise<EcartOrderResult> {
  return ecartFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      token: input.cardToken,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      currency: input.currency || 'MXN',
      notify_url: input.notifyUrl,
      reference_id: input.referenceId,
      reference: input.reference,
      items: input.items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        discount: i.discount ?? 0,
      })),
      shipping_address: {
        country: { code: 'MX', name: 'Mexico' },
        state: { code: input.shippingAddress.state },
        address1: input.shippingAddress.address1,
        city: input.shippingAddress.city,
        first_name: input.shippingAddress.first_name,
        last_name: input.shippingAddress.last_name,
        phone: input.shippingAddress.phone,
        postal_code: input.shippingAddress.postal_code,
      },
    }),
  });
}

export async function getEcartOrder(orderId: string): Promise<EcartOrderResult> {
  return ecartFetch(`/api/orders/${orderId}`);
}
