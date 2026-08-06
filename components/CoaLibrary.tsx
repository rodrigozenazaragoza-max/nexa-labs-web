'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, FileText, MessageCircle, ShieldCheck } from 'lucide-react';

export type CoaEntry = {
  slug: string;
  name: string;
  category: string;
  purity: string;
  variants: string[];
  coaUrl: string | null;
  lot: string | null;
  issuedOn: string | null;
};

// Biblioteca pública de Certificados de Análisis. Busca por nombre de
// producto o por número de lote — el cliente puede teclear el lote impreso
// en su vial y llegar directo a su certificado.
export default function CoaLibrary({
  entries,
  whatsappNumber,
}: {
  entries: CoaEntry[];
  whatsappNumber?: string;
}) {
  const [query, setQuery] = useState('');
  const [onlyWithCoa, setOnlyWithCoa] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (onlyWithCoa && !e.coaUrl) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        (e.lot ?? '').toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.variants.some((v) => v.toLowerCase().includes(q))
      );
    });
  }, [entries, query, onlyWithCoa]);

  const withCoa = entries.filter((e) => e.coaUrl).length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca por producto o número de lote…"
            className="w-full rounded-theme border border-border py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-theme border border-border px-4 py-3 text-xs font-semibold text-ink">
          <input
            type="checkbox"
            checked={onlyWithCoa}
            onChange={(e) => setOnlyWithCoa(e.target.checked)}
            className="accent-[color:var(--color-primary)]"
          />
          Solo con COA publicado
        </label>
      </div>

      <p className="mt-3 text-xs text-muted">
        {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'} · {withCoa} con
        certificado publicado
      </p>

      <div className="mt-6 overflow-hidden rounded-theme border border-border">
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No encontramos resultados para “{query}”.
          </p>
        ) : (
          filtered.map((e, i) => (
            <div
              key={e.slug}
              className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                i % 2 === 1 ? 'bg-surface/60' : 'bg-white'
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/productos/${e.slug}`} className="text-sm font-semibold text-ink hover:text-primary">
                    {e.name}
                  </Link>
                  <span className="rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-semibold text-accent">
                    {e.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {e.variants.length > 0 && <span>{e.variants.join(' · ')} — </span>}
                  <span className="font-medium text-ink">{e.purity}</span>
                  {e.lot && <span> · Lote {e.lot}</span>}
                  {e.issuedOn && (
                    <span>
                      {' '}
                      · emitido{' '}
                      {new Date(`${e.issuedOn}T12:00:00`).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </p>
              </div>

              {e.coaUrl ? (
                <a
                  href={e.coaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-theme bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-dark"
                >
                  <FileText size={13} /> Ver COA
                </a>
              ) : whatsappNumber ? (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Hola, me gustaría ver el Certificado de Análisis (COA) de ${e.name}. ¿Me lo comparten?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-theme border border-primary px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary-light"
                >
                  <MessageCircle size={13} /> Solicitar COA
                </a>
              ) : (
                <span className="shrink-0 text-xs text-muted">Solicítalo por WhatsApp</span>
              )}
            </div>
          ))
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary" />
        Los certificados se emiten por lote. Si el lote impreso en tu vial no coincide con el que
        aparece aquí, escríbenos y te compartimos el certificado exacto de tu lote.
      </p>
    </div>
  );
}
