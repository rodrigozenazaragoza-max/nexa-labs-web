// Envío de correos transaccionales (confirmación de pedido, envío, etc.)
// vía Resend — ver https://resend.com/docs.
//
// Mientras el dominio nexalabs.mx no esté verificado en Resend, solo se
// pueden mandar correos a la cuenta con la que te registraste ahí (Resend
// los bloquea a cualquier otro destinatario). El código ya queda listo — en
// cuanto verifiques el dominio, solo hay que cambiar EMAIL_FROM en Netlify
// y todo funciona sin tocar código.

import { Resend } from 'resend';
import { formatMxn } from './format';
import { siteConfig } from './site-config';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Remitente por defecto: la dirección compartida de pruebas de Resend, que
// funciona sin verificar dominio (pero solo entrega a tu propia cuenta de
// Resend). Cuando nexalabs.mx esté verificado, define EMAIL_FROM en Netlify,
// ej. "Nexa Labs <pedidos@nexalabs.mx>".
const EMAIL_FROM = process.env.EMAIL_FROM || 'Nexa Labs <onboarding@resend.dev>';

let client: Resend | null = null;
function getClient(): Resend {
  if (!RESEND_API_KEY) throw new Error('Falta RESEND_API_KEY en las variables de entorno.');
  if (!client) client = new Resend(RESEND_API_KEY);
  return client;
}

export function isEmailConfigured() {
  return Boolean(RESEND_API_KEY);
}

export type OrderConfirmationItem = {
  name: string;
  variantLabel: string | null;
  qty: number;
  unitPriceMxn: number;
};

export type OrderConfirmationData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalMxn: number;
  shippingAddress: string;
  items: OrderConfirmationItem[];
};

function itemsRowsHtml(items: OrderConfirmationItem[]): string {
  return items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
          <div style="font-weight:600;color:#0f172a;">${escapeHtml(i.name)}</div>
          ${i.variantLabel ? `<div style="font-size:12px;color:#64748b;">${escapeHtml(i.variantLabel)}</div>` : ''}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:center;color:#64748b;">x${i.qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#0f172a;">$${formatMxn(i.unitPriceMxn * i.qty)}</td>
      </tr>`
    )
    .join('');
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function orderConfirmationHtml(data: OrderConfirmationData): string {
  return `
  <div style="background:#f1f5f9;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <div style="padding:24px;text-align:center;background:#ffffff;">
        <div style="font-size:18px;font-weight:800;color:#0f172a;">${siteConfig.brand.name}</div>
        <div style="font-size:10px;letter-spacing:1px;color:#64748b;">${siteConfig.brand.tagline}</div>
      </div>
      <div style="background:#10b981;padding:28px 24px;text-align:center;color:#ffffff;">
        <div style="font-size:32px;">✅</div>
        <div style="font-size:20px;font-weight:800;margin-top:8px;">¡Pago confirmado!</div>
        <div style="font-size:13px;opacity:0.9;margin-top:4px;">Pedido #${escapeHtml(data.orderNumber)}</div>
      </div>
      <div style="padding:24px;">
        <p style="color:#334155;font-size:14px;line-height:1.6;">
          Hola <strong>${escapeHtml(data.customerName)}</strong>, recibimos tu pago de
          <strong style="color:#10b981;">$${formatMxn(data.totalMxn)} MXN</strong>. Ya estamos preparando tu pedido.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr>
              <th style="text-align:left;font-size:11px;color:#94a3b8;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">PRODUCTO</th>
              <th style="text-align:center;font-size:11px;color:#94a3b8;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">CANT.</th>
              <th style="text-align:right;font-size:11px;color:#94a3b8;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">PRECIO</th>
            </tr>
          </thead>
          <tbody>${itemsRowsHtml(data.items)}</tbody>
        </table>
        <div style="text-align:right;margin-top:12px;font-size:16px;font-weight:800;color:#0f172a;">
          Total: $${formatMxn(data.totalMxn)} MXN
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-top:20px;">
          <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;">Dirección de envío</div>
          <div style="font-size:13px;color:#334155;margin-top:4px;">${escapeHtml(data.shippingAddress)}</div>
        </div>
        <div style="margin-top:20px;padding:16px;background:#eff6ff;border-radius:8px;">
          <div style="font-weight:700;color:#0f172a;font-size:13px;">📦 ¿Qué sigue?</div>
          <div style="font-size:13px;color:#334155;margin-top:6px;">Estamos empacando tu pedido con cuidado. Te avisaremos por correo en cuanto salga a reparto, con tu número de rastreo.</div>
        </div>
      </div>
      <div style="padding:20px 24px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;">¿Preguntas? Escríbenos a ${siteConfig.contact.email} o por WhatsApp.</p>
        <p style="font-size:11px;color:#cbd5e1;margin-top:8px;">© ${new Date().getFullYear()} ${siteConfig.brand.name}. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>`;
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<void> {
  if (!isEmailConfigured()) return;
  const resend = getClient();
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: data.customerEmail,
    subject: `Pago confirmado — Pedido ${data.orderNumber}`,
    html: orderConfirmationHtml(data),
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : error.message || 'Error desconocido al enviar el correo.');
  }
}
