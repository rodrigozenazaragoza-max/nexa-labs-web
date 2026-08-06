import { PackageCheck, PackageSearch, Truck, Home } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import TrackOrderCard from '@/components/faq/TrackOrderCard';
import { siteConfig } from '@/lib/site-config';
import { createClient } from '@/lib/supabase/server';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { getSettings } from '@/lib/data';
import SupportContactCard from '@/components/SupportContactCard';

export const metadata = { title: `Rastrea tu Pedido | ${siteConfig.brand.name}` };

const STEPS = [
  { icon: PackageCheck, title: 'Pedido confirmado', desc: 'Recibes tu número de pedido por correo al finalizar la compra.' },
  { icon: PackageSearch, title: 'En preparación', desc: 'Empacamos tu pedido en empaque 100% discreto, sin logotipos.' },
  { icon: Truck, title: 'Enviado', desc: 'Te llega el número de guía y el enlace de rastreo por correo.' },
  { icon: Home, title: 'Entregado', desc: 'Recibes tu pedido en la dirección registrada.' },
];

export default async function RastreaPedidoPage({
  searchParams,
}: {
  searchParams: { pedido?: string; correo?: string };
}) {
  const supabase = createClient();
  const headerImage = await getSectionHeaderImage(supabase);
  const settings = await getSettings();
  const { shippingDaysMin, shippingDaysMax } = siteConfig.policies;

  return (
    <div>
      <SectionHeader crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Rastrea tu Pedido' }]} title="Rastrea tu Pedido" image={headerImage} />

      <div className="mx-auto max-w-3xl px-6 py-14">
        <TrackOrderCard
          initialOrderNumber={searchParams.pedido}
          initialEmail={searchParams.correo}
          whatsappNumber={settings.whatsappNumber}
        />

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.title} className="text-center">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                <s.icon size={20} />
              </span>
              <p className="text-xs font-bold text-ink">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="prose-policy mt-14 space-y-5 text-sm leading-relaxed text-muted [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
          <h2>¿Cómo sé que mi pedido fue enviado?</h2>
          <p>
            En cuanto tu pedido se despacha te enviamos un correo con tu número de guía y un
            enlace directo de seguimiento. También puedes consultarlo en cualquier momento con la
            herramienta de arriba, usando tu número de pedido y correo.
          </p>

          <h2>¿Cuánto tarda en activarse mi número de guía?</h2>
          <p>
            Puede tardar algunas horas en aparecer como "en tránsito" en el sitio de la
            paquetería una vez generada — es normal que no muestre movimiento el mismo día que se
            genera.
          </p>

          <h2>¿Cuánto tarda en llegar mi pedido?</h2>
          <p>
            Entre {shippingDaysMin} y {shippingDaysMax} días hábiles según tu zona — pedidos
            confirmados en días y horario hábiles se procesan y despachan el mismo día o el
            siguiente día hábil. No procesamos ni enviamos en fin de semana ni días festivos.
          </p>

          <h2>¿Qué hago si mi pedido no ha llegado en el tiempo estimado?</h2>
          <p>
            Contáctanos a {siteConfig.contact.email} o al {siteConfig.contact.phone} con tu
            número de pedido y lo revisamos con la paquetería de inmediato.
          </p>

          <h2>¿Mi pedido llega en un solo paquete?</h2>
          <p>
            No necesariamente. Si compras varios tipos de producto, pueden llegar en paquetes
            separados con números de rastreo distintos — es normal, no un error.
          </p>

          <h2>¿Qué hago si mi paquete llega dañado o con el sello roto?</h2>
          <p>
            Contáctanos de inmediato a {siteConfig.contact.email} con fotos del empaque — revisa
            también nuestra{' '}
            <a href="/devoluciones" className="font-semibold text-primary">política de devoluciones</a>.
          </p>
        </div>

        <div className="mt-10">
          <SupportContactCard
            title="¿No encuentras tu pedido?"
            subtitle="Escríbenos y lo revisamos contigo"
            whatsappNumber={settings.whatsappNumber}
            whatsappMessage="Hola, tengo una duda sobre el rastreo de mi pedido."
            links={[
              { label: 'Ver política de envíos', href: '/envios' },
              { label: 'Preguntas frecuentes', href: '/faq' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
