// Se regenera cada 5 min y se sirve desde caché — el catálogo no cambia
// por visitante, así que no hay razón para renderizar de cero en cada clic.
export const revalidate = 300;

import { FlaskConical, FileCheck2, Microscope } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import Pending from '@/components/faq/Pending';
import CoaLibrary, { type CoaEntry } from '@/components/CoaLibrary';
import SupportContactCard from '@/components/SupportContactCard';
import { siteConfig } from '@/lib/site-config';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { getAllProducts, getSettings } from '@/lib/data';

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
  const [headerImage, settings, allProducts] = await Promise.all([
    getSectionHeaderImage(),
    getSettings(),
    getAllProducts(),
  ]);

  const products = allProducts
    .filter((p) => p.slug !== siteConfig.diluent.slug)
    .sort((a, b) => a.name.localeCompare(b.name));

  const entries: CoaEntry[] = products.map((p: any) => ({
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

      <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Cada lote tiene su Certificado de Análisis. Teclea el número de lote impreso en tu vial —
          o el nombre del producto — y llegas directo al tuyo. Sin cuenta y sin haber comprado.
        </p>

        {/* ---------- Lo primero: el buscador ---------- */}
        <section id="lista" className="mt-6 scroll-mt-24">
          <CoaLibrary entries={entries} whatsappNumber={settings.whatsappNumber} />
        </section>

        {/* ---------- Explicación: después de la lista, para quien la quiera ---------- */}
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-heading text-h3 font-bold text-ink">¿Qué es un COA y por qué importa?</h2>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            Es el análisis de laboratorio del producto — el equivalente a un análisis de sangre, pero
            del frasco. Responde tres cosas con datos, no con adjetivos:{' '}
            <strong className="text-ink">¿es realmente esta sustancia?</strong>,{' '}
            <strong className="text-ink">¿trae los miligramos que dice?</strong> y{' '}
            <strong className="text-ink">¿qué tan puro es?</strong> Cualquiera puede imprimir “99% de
            pureza” en una etiqueta; el COA es lo que lo demuestra.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            Nosotros no sintetizamos los péptidos: los compramos. Y justo por eso no damos por buena
            la palabra del proveedor — mandamos muestra de cada producción a un{' '}
            <strong className="text-ink">laboratorio independiente en Washington, Estados Unidos</strong>,
            que no es nuestro ni tiene relación con nosotros más allá de cobrarnos el análisis. Ellos
            confirman sustancia, miligramos y pureza. Si no coincide con la etiqueta, ese material no
            se vende.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            Un certificado que emite quien te vende el producto no prueba nada. Uno que emite alguien
            sin interés en el resultado, sí. Y como cada certificado está ligado al{' '}
            <strong className="text-ink">número de lote</strong> de esa tanda específica, el COA que
            lees corresponde exactamente al material del que salió tu vial — no es un papel genérico.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {WHAT_IS_CHECKED.map((item) => (
              <div key={item.title} className="rounded-theme border border-border bg-white p-5">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                  <item.icon size={18} />
                </span>
                <p className="font-heading text-sm font-bold text-ink">{item.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>

          <Pending>
            si quieres, podemos nombrar públicamente el laboratorio y su acreditación (por ejemplo
            ISO/IEC 17025) — eso sube mucho la credibilidad. Solo publica el dato exacto que puedas
            respaldar; no inventes una acreditación que el laboratorio no tenga.
          </Pending>
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
