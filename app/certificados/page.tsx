import { FlaskConical, FileCheck2, Microscope, PackageSearch, Truck, Beaker } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import Pending from '@/components/faq/Pending';
import CoaLibrary, { type CoaEntry } from '@/components/CoaLibrary';
import SupportContactCard from '@/components/SupportContactCard';
import { siteConfig } from '@/lib/site-config';
import { createClient } from '@/lib/supabase/server';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { getAllProducts, getSettings } from '@/lib/data';

export const metadata = {
  title: `Certificados de Análisis (COA) | ${siteConfig.brand.name}`,
  description:
    'Certificado de análisis por lote: pureza por HPLC y contenido verificado. Busca el COA de tu vial por producto o número de lote.',
};

// Los 3 pasos del proceso real de verificación de Nexa Labs: comprar,
// mandar a analizar a un tercero, y ligar el resultado al lote.
const PROCESS = [
  {
    icon: PackageSearch,
    title: 'Compramos el material',
    body: 'Trabajamos con proveedores de síntesis que nos entregan el péptido liofilizado junto con su documentación. Hasta aquí, todo lo que tenemos es la palabra de alguien más.',
  },
  {
    icon: Truck,
    title: 'Lo mandamos a analizar a un tercero',
    body: 'Tomamos muestra de la producción y la enviamos a un laboratorio independiente en el estado de Washington, Estados Unidos. No es nuestro, no somos socios y no tenemos relación con ellos más allá de pagarles por el análisis. Justo por eso vale.',
  },
  {
    icon: Beaker,
    title: 'Ellos confirman qué hay en el vial',
    body: 'El laboratorio corre las pruebas y emite el certificado: qué sustancia es realmente, cuántos miligramos contiene y qué porcentaje es péptido puro. Si el resultado no coincide con lo que dice la etiqueta, ese material no se vende.',
  },
];

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
  const [headerImage, settings, allProducts] = await Promise.all([
    getSectionHeaderImage(supabase),
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

      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Cada lote que vendemos tiene su Certificado de Análisis, con producto, presentación,
          número de lote y fecha de emisión. Búscalo por nombre o teclea el lote impreso en tu vial
          para llegar directo al tuyo. No necesitas cuenta ni haber comprado: si vamos a decir que
          verificamos pureza, lo mínimo es que puedas leerlo antes de pagar.
        </p>

        {/* ---------- Qué es un COA, en peras y manzanas ---------- */}
        <section className="mt-12 rounded-theme border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-heading text-h3 font-bold text-ink">¿Qué es un COA?</h2>
          <div className="mt-3 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
            <p>
              COA son las siglas de <strong className="text-ink">Certificate of Analysis</strong> —
              Certificado de Análisis. En corto: es el resultado de las pruebas que un laboratorio
              le hizo a un producto para decir, con datos y no con adjetivos, qué contiene
              exactamente ese frasco.
            </p>
            <p>
              Piénsalo como el análisis de sangre del producto. Nadie te va a creer que estás sano
              porque tú lo digas; te lo cree porque un laboratorio corrió los estudios y sacó
              números. Con un péptido pasa lo mismo: cualquiera puede imprimir “99% de pureza” en
              una etiqueta. El COA es el documento que demuestra si eso es cierto.
            </p>
            <p>
              Un certificado responde tres preguntas concretas:{' '}
              <strong className="text-ink">¿es realmente esta sustancia?</strong>,{' '}
              <strong className="text-ink">¿trae los miligramos que dice?</strong> y{' '}
              <strong className="text-ink">¿qué tan puro es?</strong> Todo lo demás es
              conversación.
            </p>
          </div>
        </section>

        {/* ---------- Cómo verificamos: el proceso real ---------- */}
        <section className="mt-12">
          <h2 className="font-heading text-h3 font-bold text-ink">
            Por qué no nos creemos lo que nos dicen
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            Nosotros no sintetizamos los péptidos: los compramos. Y precisamente porque los
            compramos, no damos por buena la palabra de nuestro proveedor. Este es el proceso
            completo, sin adornos:
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PROCESS.map((step, i) => (
              <div key={step.title} className="relative rounded-theme border border-border bg-white p-5">
                <span className="absolute right-4 top-4 font-price text-3xl font-bold text-primary-light">
                  {i + 1}
                </span>
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                  <step.icon size={18} />
                </span>
                <p className="font-heading text-sm font-bold text-ink">{step.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
            <p>
              El punto clave está en el paso 2: el laboratorio es{' '}
              <strong className="text-ink">un tercero que no conocemos</strong>. No trabaja para
              nosotros ni para nuestro proveedor. No tiene nada que ganar diciendo que un lote está
              bien, y nada que perder diciendo que está mal. Un certificado que emite el mismo que
              te vende el producto no prueba nada; uno que emite alguien sin interés en el
              resultado, sí.
            </p>
            <p>
              Y ahí está la razón de fondo por la que hacemos esto: no es un trámite de marketing.
              Es cómo nos aseguramos <em>a nosotros mismos</em> de que lo que te estamos vendiendo
              es lo que decimos que es, antes de ponerle nuestro nombre encima.
            </p>
          </div>

          <Pending>
            si quieres, podemos nombrar públicamente el laboratorio y su acreditación (por ejemplo
            ISO/IEC 17025) — eso sube mucho la credibilidad. Solo publica el dato exacto que puedas
            respaldar; no inventes una acreditación que el laboratorio no tenga.
          </Pending>
        </section>

        {/* ---------- Número de lote ---------- */}
        <section className="mt-12 rounded-theme border-2 border-primary bg-primary-light/30 p-6 sm:p-8">
          <h2 className="font-heading text-h3 font-bold text-ink">
            El número de lote: lo que une todo
          </h2>
          <div className="mt-3 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
            <p>
              Cada producto que vendemos lleva impreso un{' '}
              <strong className="text-ink">número de lote</strong> (o batch number): el
              identificador de esa producción específica. No del producto en general —{' '}
              <em>de esa tanda</em>.
            </p>
            <p>
              El certificado está ligado a ese número. Eso significa que el COA que lees no es un
              papel genérico que aplica a todos los frascos de BPC-157 que existen: corresponde
              exactamente al material del que salió tu vial.
            </p>
            <p className="font-semibold text-ink">
              Toma tu frasco, busca el número de lote en la etiqueta, tecléalo en el buscador de
              abajo y vas a llegar al análisis de tu propio producto. Esa es toda la idea.
            </p>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
