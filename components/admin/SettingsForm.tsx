'use client';

import { useState } from 'react';
import { Check, Loader2, MessageCircle } from 'lucide-react';

export default function SettingsForm({ whatsappNumber, whatsappMessage }: { whatsappNumber: string; whatsappMessage: string }) {
  const [number, setNumber] = useState(whatsappNumber);
  const [message, setMessage] = useState(whatsappMessage);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: number, whatsappMessage: message }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-theme border border-border bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle size={18} className="text-primary" />
        <h2 className="font-heading text-sm font-bold text-ink">WhatsApp de contacto</h2>
      </div>
      <p className="mb-4 text-xs text-muted">
        Este número se usa en TODOS los botones "Contáctanos por WhatsApp" del sitio (hero, página
        de devoluciones, rastreo de pedido, etc.) — cámbialo aquí una sola vez y se actualiza en
        todos lados.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Número (con código de país, solo dígitos)</label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="5216221193067"
            className="w-full rounded-theme border border-border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-[11px] text-muted">Ej. México: 52 + 1 + 10 dígitos, sin espacios ni signos.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Mensaje inicial por defecto</label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-theme border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-5 flex items-center gap-1.5 rounded-theme bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saved && <Check size={14} />}
        {saving ? <Loader2 size={14} className="animate-spin" /> : null}
        {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar'}
      </button>
    </div>
  );
}
