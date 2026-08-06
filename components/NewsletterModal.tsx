'use client';

import { useEffect, useState } from 'react';
import { X, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

// Modal de captura de correo con código de descuento.
// Se muestra una vez por navegador (localStorage), con un pequeño delay
// para no competir con el AgeGate. El correo se guarda en la tabla
// `subscribers` de Supabase vía /api/subscribe — desde ahí puedes
// exportarlos o conectarlos a tu herramienta de email marketing.

const STORAGE_KEY = 'peptides-store-newsletter-seen';
const DELAY_MS = 1500;

export default function NewsletterModal() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [issuedCode, setIssuedCode] = useState<string | null>(null);

  useEffect(() => {
    // Nunca aparece si ya se mostró antes. (Antes también esperaba al
    // age gate, pero ese modal se eliminó del sitio.)
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIssuedCode(data.discountCode ?? null);
      localStorage.setItem(STORAGE_KEY, '1');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-5">
      <div className="relative w-full max-w-sm rounded-theme bg-white p-8 text-center shadow-2xl">
        <button onClick={dismiss} aria-label="Cerrar" className="absolute right-4 top-4 text-muted">
          <X size={18} />
        </button>

        {status === 'success' ? (
          <>
            <h2 className="font-heading text-h2 font-bold text-ink">¡Listo!</h2>
            {issuedCode ? (
              <>
                <p className="mt-2 text-sm text-muted">
                  Este código es tuyo — de un solo uso, en tu próxima compra:
                </p>
                <p className="mt-4 rounded-theme border-2 border-dashed border-primary bg-primary-light py-3 font-heading text-lg font-bold tracking-wide text-primary">
                  {issuedCode}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Ya estás suscrito — te avisaremos de ofertas y lanzamientos.
              </p>
            )}
            <button onClick={dismiss} className="mt-5 w-full rounded-theme bg-primary py-3 text-sm font-semibold text-white">
              Seguir comprando
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <Mail size={22} />
            </div>
            <h2 className="font-heading text-h2 font-bold text-ink">{siteConfig.newsletter.headline}</h2>
            <p className="mt-2 text-sm text-muted">{siteConfig.newsletter.subheadline}</p>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input
                required
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-theme border border-border px-4 py-3 text-sm"
              />
              {status === 'error' && (
                <p className="text-xs text-danger">No se pudo procesar tu correo. Intenta de nuevo.</p>
              )}
              <button
                disabled={status === 'loading'}
                className="w-full rounded-theme bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {status === 'loading' ? 'Enviando...' : `Obtener ${siteConfig.newsletter.discountPercent}% de descuento`}
              </button>
            </form>
            <button onClick={dismiss} className="mt-3 text-xs text-muted underline">
              Ahora no
            </button>
          </>
        )}
      </div>
    </div>
  );
}
