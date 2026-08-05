'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al iniciar sesión.');
      }
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-theme border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
            <Lock size={18} />
          </span>
          <h1 className="font-heading text-lg font-bold text-ink">Panel de administración</h1>
          <p className="mt-1 text-xs text-muted">Nexa Labs</p>
        </div>

        <label className="mb-1 block text-xs font-medium text-muted">Contraseña</label>
        <input
          type="password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-theme border border-border px-4 py-3 text-sm"
        />

        {error && <p className="mt-2 text-xs text-danger">{error}</p>}

        <button
          disabled={loading}
          className="mt-5 w-full rounded-theme bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
