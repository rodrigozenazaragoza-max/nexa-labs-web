'use client';

import { useState } from 'react';

const REASONS = [
  'Producto dañado en envío',
  'Producto incorrecto',
  'Problema de calidad',
  'Ya no lo necesito',
  'Otro motivo',
];

export default function ReturnRequestCard() {
  const [form, setForm] = useState({ orderNumber: '', name: '', email: '', reason: '', details: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.reason) {
      setError('Selecciona el motivo de tu devolución.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar tu solicitud.');
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div id="solicitar-devolucion" className="scroll-mt-24 rounded-theme border border-primary/30 bg-primary/5 p-6 text-center">
        <h3 className="mb-2 text-lg font-bold text-ink">Solicitud recibida</h3>
        <p className="text-sm text-muted">
          Ya registramos tu solicitud de devolución para el pedido {form.orderNumber}. Te
          contactaremos a {form.email} para confirmar los siguientes pasos. Consulta las{' '}
          <a href="/devoluciones" className="font-semibold text-primary">condiciones de devolución</a> mientras tanto.
        </p>
      </div>
    );
  }

  return (
    <div id="solicitar-devolucion" className="scroll-mt-24 rounded-theme border border-border bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-bold text-ink">Solicitar una devolución</h3>
      <p className="mb-4 text-sm text-muted">
        Usa tu número de pedido y el correo con el que compraste. Revisa las{' '}
        <a href="/devoluciones" className="text-primary">condiciones de devolución</a> antes de enviar tu solicitud.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Número de pedido"
            className="w-full rounded-theme border border-border px-4 py-2.5 text-sm"
            value={form.orderNumber}
            onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Correo registrado en la orden"
            className="w-full rounded-theme border border-border px-4 py-2.5 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <input
          required
          placeholder="Tu nombre completo"
          className="w-full rounded-theme border border-border px-4 py-2.5 text-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Motivo de la devolución</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2 rounded-theme border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={form.reason === r}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
                {r}
              </label>
            ))}
          </div>
        </div>

        <textarea
          placeholder="Detalles adicionales (opcional)"
          rows={3}
          className="w-full rounded-theme border border-border px-4 py-2.5 text-sm"
          value={form.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
        />

        {error && (
          <p className="rounded-theme border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-theme bg-primary px-6 py-3 text-sm font-bold uppercase text-white disabled:opacity-60 sm:w-auto"
        >
          {loading ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  );
}
