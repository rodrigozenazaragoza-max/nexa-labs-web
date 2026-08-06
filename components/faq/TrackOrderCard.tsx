'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

type TrackResult = {
  orderNumber: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  totalMxn: number;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  items: { name: string; variantLabel: string | null; qty: number }[];
};

// Pasos del pedido para el indicador visual del resultado — "Entregado" se
// deja preparado en la UI pero no se enciende todavía: la tabla orders no
// tiene un status "delivered" ni columna delivered_at, así que no hay forma
// real de saber que ya llegó (eso depende de la integración de paquetería
// que Rod todavía tiene que confirmar).
const ORDER_STEPS = [
  { key: 'paid', label: 'Confirmado' },
  { key: 'shipped', label: 'Enviado' },
  { key: 'delivered', label: 'Entregado' },
] as const;

function currentStepIndex(status: string): number {
  if (status === 'shipped') return 1;
  if (status === 'paid') return 0;
  return -1;
}

export default function TrackOrderCard({
  initialOrderNumber,
  initialEmail,
  whatsappNumber,
}: {
  initialOrderNumber?: string;
  initialEmail?: string;
  whatsappNumber?: string;
}) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber ?? '');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setNotFound(false);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'No se pudo consultar el pedido.');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Si el correo de confirmación trae el número de pedido y el correo en la
  // URL (?pedido=...&correo=...), buscamos automáticamente al cargar la
  // página — el cliente no tiene que volver a capturar nada.
  useEffect(() => {
    if (initialOrderNumber && initialEmail) {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supportWaUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hola, no encuentro mi pedido${orderNumber ? ` ${orderNumber}` : ''} en el rastreador. ¿Me ayudan?`
      )}`
    : null;

  return (
    <div id="rastrear-pedido" className="scroll-mt-24 rounded-theme border border-border bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-bold text-ink">Rastrea tu pedido</h3>
      <p className="mb-4 text-sm text-muted">
        Ingresa el número de pedido y el correo que usaste en tu compra — ambos
        te los enviamos por correo al confirmarse tu pedido.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <input
          required
          placeholder="Ej: NXL-20260804-A1B2C3"
          className="w-full rounded-theme border border-border px-4 py-2.5 text-sm sm:w-56"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <input
          required
          type="email"
          placeholder="tu@email.com"
          className="w-full rounded-theme border border-border px-4 py-2.5 text-sm sm:w-56"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-theme bg-primary px-6 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-60"
        >
          {loading ? 'Buscando…' : 'Rastrear'}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-theme border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {notFound && (
        <div className="mt-4 rounded-theme border border-border bg-surface p-6 text-center">
          <p className="font-bold text-ink">Pedido no encontrado</p>
          <p className="mt-1 text-sm text-muted">
            No encontramos un pedido con el número &quot;{orderNumber}&quot; y ese correo. Verifica
            que ambos coincidan exactamente con tu confirmación de compra.
          </p>
          {supportWaUrl && (
            <a
              href={supportWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-theme bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              <MessageCircle size={16} /> Contactar Soporte
            </a>
          )}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-theme border border-primary/20 bg-primary/5 p-4 text-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-ink">{result.orderNumber}</span>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase text-white">
              {result.statusLabel}
            </span>
          </div>
          <p className="text-muted">
            Pedido el {new Date(result.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {result.status !== 'cancelled' && (
            <div className="mt-4 flex items-center">
              {ORDER_STEPS.map((step, i) => {
                const active = i <= currentStepIndex(result.status);
                return (
                  <div key={step.key} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-primary' : 'bg-border'}`}
                      />
                      <span className={`mt-1 text-[10px] font-semibold ${active ? 'text-ink' : 'text-muted'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < ORDER_STEPS.length - 1 && (
                      <span className={`mx-1 h-0.5 flex-1 ${i < currentStepIndex(result.status) ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <ul className="mt-4 space-y-1 text-ink">
            {result.items.map((it, i) => (
              <li key={i}>
                {it.qty}× {it.name}
                {it.variantLabel ? ` (${it.variantLabel})` : ''}
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-border pt-3">
            {result.trackingNumber ? (
              <>
                <p className="text-ink">
                  <span className="font-semibold">Guía:</span> {result.trackingCarrier ?? 'Paquetería'} — {result.trackingNumber}
                </p>
                {result.trackingUrl && (
                  <a href={result.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">
                    Ver rastreo completo →
                  </a>
                )}
              </>
            ) : (
              <p className="text-muted">
                Tu pedido aún no tiene número de guía asignado. Te avisaremos por correo en cuanto se envíe.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
