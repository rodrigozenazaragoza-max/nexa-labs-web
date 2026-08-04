'use client';

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

export default function NewsletterFooterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

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
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
        <Check size={14} /> ¡Listo! Revisa tu correo.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu correo"
        className="w-full min-w-0 rounded-theme border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex shrink-0 items-center justify-center rounded-theme bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-60"
      >
        {status === 'loading' ? <Loader2 size={13} className="animate-spin" /> : 'Suscribir'}
      </button>
    </form>
  );
}
