'use client';

import { useState } from 'react';

type TrackResult = {
  orderNumber: string;
  statusLabel: string;
  createdAt: string;
  totalMxn: number;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  items: { name: string; variantLabel: string | null; qty: number }[];
};

export default function TrackOrderCard() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo consultar el pedido.');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
          <ul className="mt-3 space-y-1 text-ink">
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
