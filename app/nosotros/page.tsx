import Link from 'next/link';
import { FlaskConical, Eye, Headset, MapPin, Thermometer, Lock } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import SectionHeader from '@/components/SectionHeader';
import { createClient } from '@/lib/supabase/server';
import { getSectionHeaderImage } from '@/lib/section-header-image';

export const metadata = { title: `Nosotros | ${siteConfig.brand.name}` };

const stats = [
  { value: '42+', label: 'Péptidos en catálogo' },
  { value: '99%', label: 'Pureza HPLC declarada' },
  { value: '24–72h', label: 'Entrega en México' },
  { value: '100%', label: 'Lotes con COA' },
];

const values = [
  {
    icon: FlaskConical,
    title: 'Rigor por lote',
    desc: 'Cada presentación que publicamos tiene su propio número de lote y su propio certificado de análisis — no reciclamos un COA genérico entre productos distintos.',
  },
  {
    icon: Eye,
    title: 'Nada oculto',
    desc: 'Precio, stock real y presentación disponible se ven en la misma tarjeta del producto, sin letras chiquitas ni "consultar por WhatsApp" para saber cuánto cuesta.',
  },
  {
    icon: Headset,
    title: 'Alguien responde',
    desc: 'Detrás del catálogo hay un equipo chico que contesta directo — no un chatbot genérico ni un buzón que tarda una semana.',
  },
  {
    icon: MapPin,
    title: 'Pensado desde México',
    desc: 'Precios en pesos, empaque discreto y tiempos de entrega calculados para la República Mexicana, no una traducción de una tienda en dólares.',
  },
  {
    icon: Thermometer,
    title: 'Manejo cuidadoso',
    desc: 'Las presentaciones que lo requieren se preparan y embalan pensando en preservar su integridad durante el trayecto hasta tu domicilio o laboratorio.',
  },
  {
    icon: Lock,
    title: 'Solo investigación',
    desc: 'Cada producto se etiqueta y se vende explícitamente como Research Use Only. No promovemos ni facilitamos uso humano o animal bajo ninguna circunstancia.',
  },
];

export default async function NosotrosPage() {
  const supabase = createClient();
  const headerImage = await getSectionHeaderImage(supabase);

  return (
    <div>
      <SectionHeader
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Nosotros' }]}
        eyebrow="Nosotros"
        title="Un catálogo de investigación, sin misterios."
        image={headerImage}
      />
      <section className="bg-primary-light">
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <p className="max-w-2xl text-sm text-muted">
            {siteConfig.brand.name} arrancó por una razón puntual: encontrar péptidos de
            investigación en México normalmente significa esperar semanas por un envío
            internacional, pagar en dólares y confiar a ciegas en un certificado que nadie
            verifica. Decidimos armar la alternativa que nosotros mismos hubiéramos querido
            usar como investigadores.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-theme border border-border p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Qué hacemos</p>
            <h2 className="mt-2 font-heading text-lg font-bold text-ink">Un solo lugar, sin vueltas</h2>
            <p className="mt-2 text-sm text-muted">
              Concentramos catálogo, presentaciones, stock real y certificados de análisis en
              un solo sitio en español, con precios en pesos y sin tener que escribir a nadie
              para saber si algo está disponible.
            </p>
          </div>
          <div className="rounded-theme bg-primary-dark p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Hacia dónde vamos</p>
            <h2 className="mt-2 font-heading text-lg font-bold">Más catálogo, mismo estándar</h2>
            <p className="mt-2 text-sm text-white/85">
              Cada péptido nuevo que agregamos pasa por el mismo filtro: presentación clara,
              lote documentado y disponibilidad real — preferimos crecer más despacio antes
              que bajar ese estándar.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-theme border border-border p-5 text-center">
              <p className="font-price text-2xl text-primary">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary">Lo que nos define</p>
          <h2 className="mt-2 text-center font-heading text-h2 font-bold text-ink">Cómo trabajamos</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-theme border border-border bg-white p-5">
                <v.icon size={22} className="text-primary" />
                <h3 className="mt-3 font-heading text-sm font-semibold text-ink">{v.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-heading text-h2 font-bold text-ink">¿Listo para tu próxima investigación?</h2>
        <p className="mt-2 text-sm text-muted">
          Explora el catálogo o escríbenos directo si buscas algo específico.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/productos" className="rounded-theme bg-primary px-6 py-3 text-sm font-semibold text-white">
            Ver productos
          </Link>
          <Link href="/contacto" className="rounded-theme border border-border px-6 py-3 text-sm font-semibold text-ink">
            Contactar
          </Link>
        </div>
      </section>
    </div>
  );
}
