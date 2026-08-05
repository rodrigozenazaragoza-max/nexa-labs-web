'use client';

import { useState } from 'react';
import { Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    });
    setLoading(false);
    if (resetError) {
      setError('No pudimos procesar tu solicitud. Intenta de nuevo en unos minutos.');
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-theme border border-border bg-white p-8 text-center shadow-sm">
        <CheckCircle2 size={36} className="mx-auto text-primary" />
        <h2 className="mt-4 font-heading text-lg font-bold text-ink">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-muted">
          Si <strong>{email}</strong> tiene una cuenta con nosotros, te enviamos un enlace para
          restablecer tu contraseña. Revisa también spam/promociones.
        </p>
        <a
          href="/login"
          className="mt-5 inline-flex items-center gap-1.5 rounded-theme bg-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={14} /> Volver a iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-theme border border-border bg-white p-7 shadow-sm">
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Correo electrónico</label>
        <div className="flex items-center gap-2 rounded-theme border border-border px-3.5 py-2.5">
          <Mail size={16} className="text-muted" />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full text-sm outline-none"
          />
        </div>
      </div>

      {error && <p className="rounded-theme bg-danger-bg px-3 py-2 text-xs font-medium text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-theme bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        Enviar enlace de recuperación
      </button>

      <a href="/login" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
        <ArrowLeft size={13} /> Volver a iniciar sesión
      </a>
    </form>
  );
}
