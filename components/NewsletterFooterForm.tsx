'use client';

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

export default function NewsletterFooterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [issuedCode, setIssuedCode] = useState<string | null>(null);

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
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="text-xs">
        <p className="flex items-center gap-1.5 font-semibold text-primary-dark">
          <Check size={14} /> ¡Listo!
        </p>
        {issuedCode && (
          <p className="mt-2 rounded-theme border border-dashed border-primary bg-white px-3 py-2 text-center font-heading text-sm font-bold tracking-wide text-primary-dark">
            {issuedCode}
          </p>
        )}
        <p className="mt-1.5 text-muted">
          {issuedCode ? 'Tu código de un solo uso — úsalo en tu próxima compra.' : 'Ya estás suscrito.'}
        </p>
      </div>
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
        className="w-full min-w-0 rounded-theme border border-primary/25 bg-white px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-primary focus:outline-none"
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
