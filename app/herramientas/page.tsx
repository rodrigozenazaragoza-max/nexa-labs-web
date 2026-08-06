import Link from 'next/link';
import { Calculator, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import SupportContactCard from '@/components/SupportContactCard';
import { siteConfig } from '@/lib/site-config';
import { createClient } from '@/lib/supabase/server';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { getSiteSettings } from '@/lib/get-settings';

export const metadata = {
  title: `Herramientas | ${siteConfig.brand.name}`,
  description:
    'Herramientas gratuitas para investigación con péptidos: calculadora de reconstitución, concentración y unidades de jeringa.',
};

// Índice de herramientas. Para agregar una nueva: crea su página bajo
// app/herramientas/<slug>/ y añade la entrada aquí — el nav y el footer
// apuntan a este índice, así que no hay que tocarlos.
const TOOLS = [
  {
    href: '/herramientas/calculadora',
    icon: Calculator,
    name: 'Calculadora de Reconstitución',
    desc: 'Cuánta agua bacteriostática agregar, qué concentración queda y hasta qué unidad jalar la jeringa. Gratis y sin registro.',
    tag: 'Más usada',
  },
];

export default async function HerramientasPage() {
  const supabase = createClient();
  const headerImage = await getSectionHeaderImage(supabase);
  const settings = await getSiteSettings(supabase);

  return (
    <div>
      <SectionHeader
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Herramientas' }]}
        eyebrow="Recursos"
        title="Herramientas"
        image={headerImage}
      />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Herramientas gratuitas que resuelven la parte aritmética del trabajo con péptidos de
          investigación. Sin registro, sin costo, y todo se calcula en tu navegador.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-theme border border-border bg-white p-6 transition hover:border-primary hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                  <tool.icon size={20} />
                </span>
                {tool.tag && (
                  <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-semibold text-accent">
                    {tool.tag}
                  </span>
                )}
              </div>
              <p className="font-heading text-base font-bold text-ink">{tool.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{tool.desc}</p>
              <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary">
                Abrir herramienta
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}

          <div className="flex flex-col justify-center rounded-theme border border-dashed border-border p-6 text-center">
            <p className="text-sm font-semibold text-ink">Más herramientas en camino</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              ¿Qué te ayudaría en tu trabajo? Escríbenos y la construimos.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <SupportContactCard
            title="¿Necesitas otra herramienta?"
            subtitle="Cuéntanos qué te haría el trabajo más fácil"
            whatsappNumber={settings.whatsappNumber}
            whatsappMessage="Hola, tengo una idea de herramienta que me ayudaría."
            links={[
              { label: 'Ver catálogo', href: '/productos' },
              { label: 'Preguntas frecuentes', href: '/faq' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
