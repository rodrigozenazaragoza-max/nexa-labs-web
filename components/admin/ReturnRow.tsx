'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMxn } from '@/lib/format';

const STATUS_OPTIONS = ['pendiente', 'aprobada', 'rechazada', 'completada'];

const STATUS_STYLE: Record<string, string> = {
  pendiente: 'bg-warn-bg text-warn',
  aprobada: 'bg-primary-light text-primary',
  rechazada: 'bg-danger-bg text-danger',
  completada: 'bg-surface text-ink',
};

export type ReturnRecord = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  reason: string;
  details: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  order: { total_mxn: number; customer_phone: string; status: string } | null;
};

export default function ReturnRow({ r }: { r: ReturnRecord }) {
  const router = useRouter();
  const [status, setStatus] = useState(r.status);
  const [notes, setNotes] = useState(r.admin_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/returns/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
    } catch {
      alert('No se pudo guardar el cambio.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-theme border border-border bg-white p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">{r.order_number}</p>
          <p className="text-xs text-muted">
            {r.customer_name} · {r.customer_email}
            {r.order && ` · Pedido: $${formatMxn(r.order.total_mxn)}`}
          </p>
          <p className="mt-1 text-xs text-muted">
            {new Date(r.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLE[r.status] ?? ''}`}>
          {r.status}
        </span>
      </div>

      <p className="mb-1 text-sm text-ink"><span className="font-semibold">Motivo:</span> {r.reason}</p>
      {r.details && <p className="mb-3 text-sm text-muted">"{r.details}"</p>}

      <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-border pt-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Estatus</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-theme border border-border px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-muted">Notas internas</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: reembolso procesado el 05/08"
            className="w-full rounded-theme border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-theme bg-primary px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-60"
        >
          {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
