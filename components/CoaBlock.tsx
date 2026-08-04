import { ShieldCheck, ArrowRight } from 'lucide-react';

// Bloque "Ver Certificado de Análisis (COA)", estilo Exoma Peptides —
// vive justo debajo del selector de dosis en la página de producto.
export default function CoaBlock({ coaUrl, purity }: { coaUrl: string | null; purity: string }) {
  if (!coaUrl) return null;

  return (
    <a
      href={coaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 rounded-theme border border-border bg-surface px-4 py-3.5 transition hover:border-primary"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <ShieldCheck size={16} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Ver Certificado de Análisis (COA)</p>
          <p className="text-xs text-muted">{purity} de pureza por HPLC · verificable por lote</p>
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
        Abrir <ArrowRight size={13} />
      </span>
    </a>
  );
}
