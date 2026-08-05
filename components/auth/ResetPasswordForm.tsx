'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase detecta el token de recuperación en la URL (hash) y crea una
    // sesión temporal automáticamente al cargar el cliente en el navegador.
    // Esperamos ese evento antes de mostrar el formulario.
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
      }
    });

    // Si ya había una sesión de recuperación activa antes de que se montara el listener.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const timeout = setTimeout(() => {
      setReady((r) => {
        if (!r) setInvalid(true);
        return r;
      });
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError('No pudimos actualizar tu contraseña. Solicita un nuevo enlace e intenta de nuevo.');
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push('/mi-cuenta');
      router.refresh();
    }, 2000);
  }

  if (invalid) {
    return (
      <div className="rounded-theme border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-muted">
          Este enlace ya expiró o no es válido. Solicita uno nuevo desde la pantalla de recuperación.
        </p>
        <a href="/recuperar" className="mt-5 inline-block rounded-theme bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Solicitar nuevo enlace
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-theme border border-border bg-white p-8 text-center shadow-sm">
        <CheckCircle2 size={36} className="mx-auto text-primary" />
        <h2 className="mt-4 font-heading text-lg font-bold text-ink">Contraseña actualizada</h2>
        <p className="mt-2 text-sm text-muted">Te llevamos a tu cuenta…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center rounded-theme border border-border bg-white p-8 shadow-sm">
        <Loader2 size={20} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-theme border border-border bg-white p-7 shadow-sm">
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Nueva contraseña</label>
        <div className="flex items-center gap-2 rounded-theme border border-border px-3.5 py-2.5">
          <Lock size={16} className="text-muted" />
          <input
            required
            minLength={6}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm outline-none"
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-muted">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Confirmar contraseña</label>
        <div className="flex items-center gap-2 rounded-theme border border-border px-3.5 py-2.5">
          <Lock size={16} className="text-muted" />
          <input
            required
            minLength={6}
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
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
        Guardar nueva contraseña
      </button>
    </form>
  );
}
