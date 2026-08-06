import { FlaskConical, FileCheck2, Microscope } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import CoaLibrary, { type CoaEntry } from '@/components/CoaLibrary';
import SupportContactCard from '@/components/SupportContactCard';
import { siteConfig } from '@/lib/site-config';
import { createClient } from '@/lib/supabase/server';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { getSiteSettings } from '@/lib/get-settings';

export const metadata = {
  title: `Certificados de Análisis (COA) | ${siteConfig.brand.name}`,
  description:
    'Certificado de análisis por lote: pureza por HPLC y contenido verificado. Busca el COA de tu vial por producto o número de lote.',
};

// Qué revisa un COA — se explica arriba de la lista para que el cliente
// entienda qué está viendo antes de abrir un PDF lleno de gráficas.
const WHAT_IS_CHECKED = [
  {
    icon: Microscope,
    title: 'Pureza por HPLC',
    body: 'Cromatografía líquida de alta resolución: separa el compuesto de cualquier impureza y mide qué porcentaje del contenido es realmente el péptido declarado.',
  },
  {
    icon: FlaskConical,
    title: 'Identidad molecular',
    body: 'Espectrometría de masas: confirma que la molécula analizada corresponde exactamente al compuesto de la etiqueta, y no a una secuencia parecida.',
  },
  {
    icon: FileCheck2,
    title: 'Trazabilidad por lote',
    body: 'Cada certificado corresponde a un lote de producción específico, con su número y fecha de emisión. No es un documento genérico del producto.',
  },
];

export default async function CertificadosPage() {
  const supabase = createClient();
  const headerImage = await getSectionHeaderImage(supabase);
  const settings = await getSiteSettings(supabase);

  const { data: products } = await supabase
    .from('products')
    .select('slug, name, category, purity, coa_url, coa_lot, coa_issued_on, variants:product_variants(label, sort_order)')
    .neq('slug', siteConfig.diluent.slug)
    .order('name');

  const entries: CoaEntry[] = (products ?? []).map((p: any) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    purity: p.purity,
    variants: [...(p.variants ?? [])]
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((v: any) => v.label),
    coaUrl: p.coa_url,
    lot: p.coa_lot,
    issuedOn: p.coa_issued_on,
  }));

  return (
    <div>
      <SectionHeader
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Certificados de Análisis' }]}
        eyebrow="Transparencia"
        title="Certificados de Análisis (COA)"
        image={headerImage}
      />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Cada lote que vendemos tiene su Certificado de Análisis, con producto, presentación,
          número de lote y fecha de emisión. Búscalo por nombre o teclea el lote impreso en tu vial
          para llegar directo al tuyo. No necesitas cuenta ni haber comprado: si vamos a decir que
          verificamos pureza, lo mínimo es que puedas leerlo antes de pagar.
        </p>

        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {WHAT_IS_CHECKED.map((item) => (
            <div key={item.title} className="rounded-theme border border-border bg-white p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                <item.icon size={18} />
              </span>
              <p className="font-heading text-sm font-bold text-ink">{item.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </section>

        <section id="lista" className="mt-12 scroll-mt-24">
          <h2 className="mb-1 font-heading text-h3 font-bold text-ink">Busca tu certificado</h2>
          <p className="mb-6 text-sm text-muted">
            Por nombre de producto, categoría, presentación o número de lote.
          </p>
          <CoaLibrary entries={entries} whatsappNumber={settings.whatsappNumber} />
        </section>

        <div className="mt-12">
          <SupportContactCard
            title="¿No encuentras el COA de tu lote?"
            subtitle="Mándanos el número impreso en tu vial y te lo compartimos"
            whatsappNumber={settings.whatsappNumber}
            whatsappMessage="Hola, quiero el Certificado de Análisis de mi lote. El número impreso en mi vial es:"
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
