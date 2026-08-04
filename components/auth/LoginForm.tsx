'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Pantalla de login/registro con identidad propia de Nexa Labs — no es una
// copia del layout de swisschems.is (ellos usan dos columnas con bullets a
// la izquierda + Cloudflare captcha a la derecha). Aquí es una sola tarjeta
// centrada sobre un fondo con degradado de marca, con tabs propios y una
// franja de confianza abajo en vez de una lista lateral.
type Mode = 'login' | 'register';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/mi-cuenta';

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push(next);
        router.refresh();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          // Confirmación de correo desactivada — ya quedó con sesión activa.
          router.push(next);
          router.refresh();
        } else {
          // Confirmación de correo activada — falta que confirme desde su correo.
          setRegistered(true);
        }
      }
    } catch (err: any) {
      setError(traducirError(err.message));
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="rounded-theme border border-border bg-white p-8 text-center shadow-sm">
        <CheckCircle2 size={36} className="mx-auto text-primary" />
        <h2 className="mt-4 font-heading text-lg font-bold text-ink">Cuenta creada</h2>
        <p className="mt-2 text-sm text-muted">
          Te enviamos un correo a <strong>{email}</strong> para confirmar tu cuenta. Revisa spam si
          no lo ves. Una vez confirmada, inicia sesión desde aquí.
        </p>
        <button
          onClick={() => {
            setRegistered(false);
            setMode('login');
          }}
          className="mt-5 rounded-theme bg-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-theme border border-border bg-white shadow-sm">
      <div className="grid grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`py-4 text-sm font-bold uppercase tracking-wide transition ${
            mode === 'login' ? 'bg-ink text-white' : 'bg-surface text-muted hover:text-ink'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`py-4 text-sm font-bold uppercase tracking-wide transition ${
            mode === 'register' ? 'bg-ink text-white' : 'bg-surface text-muted hover:text-ink'
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-7">
        {mode === 'register' && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Nombre completo</label>
            <div className="flex items-center gap-2 rounded-theme border border-border px-3.5 py-2.5">
              <User size={16} className="text-muted" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full text-sm outline-none"
              />
            </div>
          </div>
        )}

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

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Contraseña</label>
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

        {error && <p className="rounded-theme bg-danger-bg px-3 py-2 text-xs font-medium text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-theme bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {mode === 'login' ? 'Entrar' : 'Crear mi cuenta'}
        </button>

        <p className="text-center text-[11px] text-muted">
          Al continuar confirmas que usarás los productos exclusivamente para investigación
          científica y que eres mayor de edad.
        </p>
      </form>
    </div>
  );
}

function traducirError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (message.includes('User already registered')) return 'Ya existe una cuenta con ese correo — inicia sesión.';
  if (message.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
  return message;
}
