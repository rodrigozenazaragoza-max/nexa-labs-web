import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

// Encabezado sombreado (fondo tintado) con breadcrumb + título de sección,
// estilo SwissChems. Si se pasa `image`, se muestra un frasco de fondo del
// lado derecho, difuminado hacia la izquierda, para que el banner no se
// vea vacío/desbalanceado en pantallas anchas. La imagen se resuelve en
// la página que llama a este componente (server component) y se pasa
// como prop — así SectionHeader se puede usar también dentro de páginas
// cliente (ej. checkout) sin arrastrar código de servidor.
export default function SectionHeader({
  eyebrow,
  title,
  crumbs,
  image,
}: {
  eyebrow?: string;
  title: string;
  crumbs?: { label: string; href?: string }[];
  image?: string | null;
}) {
  return (
    <div className="relative overflow-hidden bg-primary-light">
      {image && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] max-w-[460px] md:block"
          style={{
            maskImage: 'linear-gradient(to left, black 45%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 45%, transparent 100%)',
          }}
        >
          <Image src={image} alt="" fill className="object-cover object-center opacity-80 blur-[1.5px]" sizes="460px" />
        </div>
      )}
      <div className="relative mx-auto max-w-7xl px-6 py-10">
        {crumbs && crumbs.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-primary">{c.label}</Link>
                ) : (
                  <span className="font-medium text-ink">{c.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
            <span className="h-3 w-0.5 bg-primary" /> {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-h2 font-bold leading-tight text-ink">{title}</h1>
      </div>
    </div>
  );
}
