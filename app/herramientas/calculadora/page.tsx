import Link from 'next/link';
import { Droplets, Syringe, FlaskConical, Snowflake, TriangleAlert } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import ReconstitutionCalculator, { type CalcProduct } from '@/components/tools/ReconstitutionCalculator';
import SupportContactCard from '@/components/SupportContactCard';
import { siteConfig } from '@/lib/site-config';
import { createClient } from '@/lib/supabase/server';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { getAllProducts, getSettings } from '@/lib/data';

export const metadata = {
  title: `Calculadora de Reconstitución | ${siteConfig.brand.name}`,
  description:
    'Calculadora gratuita de reconstitución de péptidos: cuánta agua bacteriostática agregar, concentración por vial y unidades exactas en jeringa de insulina. Sin registro.',
};

// Los 4 pasos de reconstitución, contados en lenguaje simple. Cada uno con
// su "por qué" — es lo que separa una guía útil de una lista de pasos.
const STEPS = [
  {
    icon: FlaskConical,
    title: 'Limpia los dos tapones',
    body: 'Pasa alcohol por el tapón del vial de péptido y por el del agua bacteriostática antes de picar cualquiera de los dos.',
    why: 'El tapón se ve limpio, pero es la superficie que la aguja va a atravesar.',
  },
  {
    icon: Droplets,
    title: 'Jala primero el agua',
    body: 'Carga en la jeringa la cantidad de agua bacteriostática que decidiste, y recién entonces acércate al vial del péptido.',
    why: 'Así mides el agua con exactitud, sin improvisar con el polvo ya expuesto.',
  },
  {
    icon: Syringe,
    title: 'Deja correr el agua por la pared',
    body: 'Apunta el chorro a la pared interior del vial, no directo al polvo. Que baje despacio.',
    why: 'Un chorro directo golpea el péptido; la pared lo deja disolverse suave.',
  },
  {
    icon: Snowflake,
    title: 'Gira, nunca agites',
    body: 'Rueda el vial entre los dedos hasta que el polvo desaparezca. Guárdalo en refrigeración, lejos de la luz.',
    why: 'Agitar hace espuma y estresa la molécula. Girar la respeta.',
  },
];

const FAQ = [
  {
    q: '¿Qué significa "reconstituir"?',
    a: 'Es agregarle líquido —casi siempre agua bacteriostática— a un péptido liofilizado (deshidratado por congelación) para volverlo una solución que se pueda medir con precisión.',
  },
  {
    q: '¿Qué es el agua bacteriostática y por qué esa y no otra?',
    a: 'Es agua estéril con aproximadamente 0.9% de alcohol bencílico como conservador. Ese conservador inhibe el crecimiento bacteriano, que es justo lo que permite que un vial se use varias veces a lo largo de semanas en refrigeración. El agua estéril simple también disuelve el péptido, pero al no tener conservador se considera de un solo uso.',
  },
  {
    q: '¿Cuánta agua debo agregar?',
    a: 'La cantidad de agua NO cambia cuánto péptido hay en el vial — solo cambia en cuántas unidades queda repartido. Más agua reparte la misma cantidad en más unidades (más fácil de medir con precisión); menos agua la concentra en menos unidades. Los volúmenes más usados van de 1 a 3 mL.',
  },
  {
    q: '¿Por qué cambian las unidades si agrego más agua?',
    a: 'Porque la misma cantidad de péptido queda distribuida en un volumen mayor, así que cada microgramo ocupa más mililitros — y por lo tanto más unidades — de solución. Cambia la medición, no la cantidad.',
  },
  {
    q: '¿Qué jeringa uso: 1 mL, 0.5 mL o 0.3 mL?',
    a: 'Las tres usan la misma escala U-100, donde 1 unidad equivale a 0.01 mL. La cantidad de unidades es idéntica en cualquiera de ellas; lo único que cambia es la capacidad total y qué tan separadas se ven las rayitas. Un barril más chico separa más las marcas, lo que hace más fácil leer volúmenes pequeños.',
  },
  {
    q: '¿Y si mi resultado no cae en una unidad exacta?',
    a: 'Redondea a la media unidad o unidad entera que puedas leer con confianza, o reconstituye con otra cantidad de agua para que el número caiga en una marca más cómoda. Si constantemente quedas entre rayitas, una jeringa de barril más chico o una solución más diluida te lo resuelve.',
  },
  {
    q: '¿Esta calculadora me dice qué dosis usar?',
    a: 'No. La calculadora convierte una cantidad que tú ya definiste en unidades de jeringa — es aritmética, no un protocolo. Nexa Labs no da indicaciones de dosis ni de uso en humanos: nuestros productos son exclusivamente para investigación.',
  },
];

// Ratios de referencia comunes — puntos de partida para entender la
// aritmética, NO recomendaciones de dosis.
const RATIOS = [
  { peptide: 'BPC-157', vial: '5 mg', water: '2 mL', conc: '2.5 mg/mL', perUnit: '25 mcg' },
  { peptide: 'TB-500', vial: '10 mg', water: '3 mL', conc: '3.33 mg/mL', perUnit: '33.3 mcg' },
  { peptide: 'MOTS-c', vial: '10 mg', water: '2 mL', conc: '5 mg/mL', perUnit: '50 mcg' },
  { peptide: 'Retatrutida', vial: '5 mg', water: '2 mL', conc: '2.5 mg/mL', perUnit: '25 mcg' },
  { peptide: 'Ipamorelina', vial: '5 mg', water: '2 mL', conc: '2.5 mg/mL', perUnit: '25 mcg' },
];

// Saca los mg de una etiqueta de presentación ("5 mg", "10 mg (5+5)",
// "600 mg"). El total es el número que va antes de "mg" — en las mezclas,
// el paréntesis solo desglosa cómo se reparte ese mismo total.
function parseMg(label: string): number | null {
  const match = label.match(/^([\d.]+)\s*mg/i);
  if (!match) return null; // descarta presentaciones en ml (ej. agua bacteriostática)
  const mg = parseFloat(match[1]);
  return mg > 0 ? mg : null;
}

export default async function CalculadoraPage() {
  const supabase = createClient();
  const [headerImage, settings, allProducts] = await Promise.all([
    getSectionHeaderImage(supabase),
    getSettings(),
    getAllProducts(),
  ]);

  // Catálogo real para el selector de péptido — cada producto con las
  // presentaciones que de verdad vendemos. Se excluye el agua
  // bacteriostática (es el diluyente, no un péptido a reconstituir).
  const calcProducts: CalcProduct[] = allProducts
    .filter((p) => p.slug !== siteConfig.diluent.slug)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p: any) => ({
      name: p.name,
      slug: p.slug,
      variants: [...(p.variants ?? [])]
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((v: any) => ({ label: v.label, mg: parseMg(v.label) }))
        .filter((v: any): v is { label: string; mg: number } => v.mg !== null),
    }))
    .filter((p) => p.variants.length > 0);

  return (
    <div>
      <SectionHeader
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Herramientas', href: '/herramientas' }, { label: 'Calculadora de Reconstitución' }]}
        eyebrow="Herramientas"
        title="Calculadora de Reconstitución"
        image={headerImage}
      />

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* ---------- Aviso RUO — lo primero que se ve ---------- */}
        <div className="rounded-2xl border border-danger/25 bg-[#faf6f4] px-6 py-5">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <TriangleAlert size={16} className="text-danger" />
            <span><span className="text-danger">Importante:</span> esta herramienta es solo aritmética.</span>
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Convierte una cantidad que tú defines en unidades de jeringa. No indica dosis, no valida
            protocolos y no sustituye a un profesional. Todos los productos de {siteConfig.brand.name}{' '}
            son compuestos de referencia para investigación científica (RUO): no son medicamentos,
            alimentos ni cosméticos, y su introducción al cuerpo humano o animal está prohibida.
          </p>
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
          Tu vial llega como polvo. Para trabajar con él hay que devolverle el líquido — y ahí
          empieza la aritmética: cuánta agua, cuánta concentración queda, y hasta qué rayita de la
          jeringa jalar. Esta herramienta hace esa cuenta por ti, gratis y sin registro.
        </p>

        {/* ---------- Instrucciones: los 4 pasos ---------- */}
        <section className="mt-10">
          <h2 className="font-heading text-h3 font-bold text-ink">Antes de calcular: los 4 pasos</h2>
          <p className="mt-1 text-sm text-muted">
            La reconstitución no es difícil, pero sí tiene un orden. Este es:
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-theme border border-border bg-white p-5">
                <span className="absolute right-4 top-4 font-price text-3xl font-bold text-primary-light">
                  {i + 1}
                </span>
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                  <step.icon size={18} />
                </span>
                <p className="font-heading text-sm font-bold text-ink">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
                <p className="mt-2.5 border-l-2 border-primary/40 pl-3 text-xs italic leading-relaxed text-muted">
                  {step.why}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- La calculadora ---------- */}
        <section id="calculadora" className="mt-14 scroll-mt-24">
          <h2 className="font-heading text-h3 font-bold text-ink">La calculadora</h2>
          <p className="mb-6 mt-1 text-sm text-muted">
            Cuatro pasos y listo. Elige tu péptido de nuestro catálogo, dinos cuánta agua le vas a
            agregar, y te decimos exactamente hasta qué rayita llenar tu jeringa.
          </p>
          <ReconstitutionCalculator products={calcProducts} />
        </section>

        {/* ---------- Cómo funciona la matemática ---------- */}
        <section className="mt-14">
          <h2 className="font-heading text-h3 font-bold text-ink">Cómo funciona la matemática</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            El péptido se disuelve de forma pareja en el agua que agregas, así que la concentración
            es simplemente los miligramos del vial divididos entre los mililitros de agua. Las
            jeringas de insulina están marcadas en unidades, donde 100 unidades equivalen a 1 mL.
          </p>
          <div className="mt-5 space-y-2.5 rounded-theme border border-border bg-surface p-5 font-price text-sm text-ink">
            <p><span className="text-muted">Concentración (mg/mL)</span> = mg del vial ÷ mL de agua</p>
            <p><span className="text-muted">Unidades a extraer</span> = (mcg objetivo ÷ (mg vial × 1000)) × mL agua × 100</p>
            <p><span className="text-muted">Dosis por vial</span> = (mg vial × 1000) ÷ mcg objetivo</p>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            Un ejemplo para aterrizarlo: un vial de 5 mg reconstituido con 2 mL de agua queda en
            2.5 mg/mL — es decir, 25 mcg por cada unidad de la jeringa. Una cantidad de 250 mcg son
            entonces 10 unidades, o 0.10 mL. Ese vial rinde 20 dosis de ese tamaño.
          </p>
        </section>

        {/* ---------- Ratios de referencia ---------- */}
        <section className="mt-14">
          <h2 className="font-heading text-h3 font-bold text-ink">Ratios de referencia comunes</h2>
          <p className="mt-1 text-sm text-muted">
            Puntos de partida para entender la aritmética — no son recomendaciones.
          </p>
          <div className="mt-5 overflow-x-auto rounded-theme border border-border">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="bg-surface text-left text-xs font-bold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Péptido</th>
                  <th className="px-4 py-3">Vial</th>
                  <th className="px-4 py-3">Agua BAC</th>
                  <th className="px-4 py-3">Concentración</th>
                  <th className="px-4 py-3">Por unidad</th>
                </tr>
              </thead>
              <tbody>
                {RATIOS.map((r, i) => (
                  <tr key={r.peptide} className={i % 2 === 0 ? 'bg-white' : 'bg-surface/50'}>
                    <td className="px-4 py-3 font-semibold text-ink">{r.peptide}</td>
                    <td className="px-4 py-3 text-muted">{r.vial}</td>
                    <td className="px-4 py-3 text-muted">{r.water}</td>
                    <td className="px-4 py-3 font-price text-ink">{r.conc}</td>
                    <td className="px-4 py-3 font-price text-ink">{r.perUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted">
            ¿Te falta agua bacteriostática?{' '}
            <Link href={`/productos/${siteConfig.diluent.slug}`} className="font-semibold text-primary">
              La tenemos en el catálogo →
            </Link>
          </p>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="mt-14">
          <h2 className="font-heading text-h3 font-bold text-ink">Preguntas frecuentes</h2>
          <div className="mt-5 space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-theme border border-border bg-white p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:content-none">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-12">
          <SupportContactCard
            title="¿Dudas con tu cálculo?"
            subtitle="Escríbenos y lo revisamos contigo"
            whatsappNumber={settings.whatsappNumber}
            whatsappMessage="Hola, tengo una duda sobre la calculadora de reconstitución."
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
