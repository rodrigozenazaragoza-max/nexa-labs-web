'use client';

import { useState } from 'react';
import { Bell, Shield, PackageCheck, X, User, Mail } from 'lucide-react';

// Modal de "avísame cuando vuelva a haber stock" — se abre desde
// ProductPurchaseBox cuando la presentación elegida está agotada.
export default function NotifyMeModal({
  productId,
  productName,
  variantId,
  variantLabel,
  onClose,
}: {
  productId: string;
  productName: string;
  variantId?: string | null;
  variantLabel?: string | null;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/notify-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variantId: variantId ?? null,
          productName: variantLabel ? `${productName} ${variantLabel}` : productName,
          name,
          email,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-theme bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
              <Bell size={16} />
            </span>
            <div>
              <p className="font-heading text-sm font-bold text-ink">Sé el primero en recibirlo</p>
              <p className="text-xs text-muted">
                {productName}
                {variantLabel ? ` ${variantLabel}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {status === 'done' ? (
          <p className="rounded-theme bg-primary-light p-4 text-sm text-ink">
            Listo, te avisamos por correo en cuanto haya stock de este lote.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted">Nombre</span>
              <div className="flex items-center gap-2 rounded-theme border border-border px-3 py-2.5">
                <User size={14} className="text-muted" />
                <input
                  className="w-full text-sm outline-none"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted">Correo electrónico</span>
              <div className="flex items-center gap-2 rounded-theme border border-border px-3 py-2.5">
                <Mail size={14} className="text-muted" />
                <input
                  required
                  type="email"
                  className="w-full text-sm outline-none"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>

            {status === 'error' && (
              <p className="text-xs text-danger">No se pudo guardar tu aviso, intenta de nuevo.</p>
            )}

            <button
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-theme bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Bell size={14} />
              {status === 'loading' ? 'Guardando...' : 'Activar aviso'}
            </button>

            <div className="flex items-center justify-between pt-1 text-[11px] text-muted">
              <span className="flex items-center gap-1"><Shield size={12} /> Sin spam, un correo por dosis</span>
              <span className="flex items-center gap-1"><PackageCheck size={12} /> Lote nuevo con COA</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
