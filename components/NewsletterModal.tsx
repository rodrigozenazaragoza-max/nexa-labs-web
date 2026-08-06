'use client';

import { useEffect, useState } from 'react';
import { X, Mail, Check, Sparkles, ShieldCheck, Truck } from 'lucide-react';
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-5">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
        >
          <X size={16} />
        </button>

        {status === 'success' ? (
          <>
            {/* Cabecera de éxito — verde sólido, celebratoria */}
            <div className="bg-primary-dark px-8 pb-7 pt-9 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
                <Check size={26} strokeWidth={2.5} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">¡Listo!</h2>
              <p className="mt-1 text-sm text-white/80">
                {issuedCode ? 'Tu código personal está abajo' : 'Ya estás en la lista'}
              </p>
            </div>
            <div className="px-8 pb-8 pt-6 text-center">
              {issuedCode ? (
                <>
                  <p className="text-sm text-muted">
                    Es tuyo y de <strong className="text-ink">un solo uso</strong>. Aplícalo al pagar:
                  </p>
                  <p className="mt-3 rounded-theme border-2 border-dashed border-primary bg-primary-light py-3.5 font-heading text-xl font-bold tracking-[0.08em] text-primary-dark">
                    {issuedCode}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    También te lo mandamos por correo, por si lo pierdes.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">
                  Ya estabas suscrito — te avisaremos de ofertas y lanzamientos.
                </p>
              )}
              <button
                onClick={dismiss}
                className="mt-5 w-full rounded-theme bg-primary py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-dark"
              >
                Seguir comprando
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Cabecera con degradado de marca y el "10%" como protagonista */}
            <div
              className="relative overflow-hidden px-8 pb-8 pt-10 text-center"
              style={{ backgroundImage: 'linear-gradient(135deg, #038d77 0%, #27caaf 100%)' }}
            >
              {/* Círculos decorativos de fondo */}
              <span className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
              <span className="pointer-events-none absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-white/10" />

              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                <Sparkles size={12} /> Solo para nuevos suscriptores
              </span>

              <p className="relative mt-4 font-price text-6xl font-extrabold leading-none text-white drop-shadow-sm">
                {siteConfig.newsletter.discountPercent}%
              </p>
              <p className="relative mt-1 font-heading text-lg font-bold uppercase tracking-[0.15em] text-white/95">
                de descuento
              </p>
              <p className="relative mx-auto mt-3 max-w-[250px] text-sm leading-relaxed text-white/85">
                {siteConfig.newsletter.subheadline}
              </p>
            </div>

            <div className="px-8 pb-7 pt-6">
              <form onSubmit={submit} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    required
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-theme border border-border py-3.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                {status === 'error' && (
                  <p className="text-xs text-danger">No se pudo procesar tu correo. Intenta de nuevo.</p>
                )}
                <button
                  disabled={status === 'loading'}
                  className="w-full rounded-theme bg-primary py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:opacity-50"
                >
                  {status === 'loading' ? 'Enviando...' : 'Quiero mi descuento'}
                </button>
              </form>

              {/* Micro-señales de confianza, para que no se sienta un formulario frío */}
              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-primary" /> COA por lote
                </span>
                <span className="flex items-center gap-1">
                  <Truck size={12} className="text-primary" /> Envío 24–72 h
                </span>
              </div>

              <button
                onClick={dismiss}
                className="mt-4 w-full text-center text-xs text-muted underline"
              >
                Ahora no
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
