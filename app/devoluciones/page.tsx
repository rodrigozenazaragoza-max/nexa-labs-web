// Se regenera cada 5 min y se sirve desde caché — el catálogo no cambia
// por visitante, así que no hay razón para renderizar de cero en cada clic.
export const revalidate = 300;

import SectionHeader from '@/components/SectionHeader';
import ReturnRequestCard from '@/components/faq/ReturnRequestCard';
import { siteConfig } from '@/lib/site-config';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { getSettings } from '@/lib/data';
import SupportContactCard from '@/components/SupportContactCard';

export const metadata = { title: `Devoluciones | ${siteConfig.brand.name}` };

export default async function DevolucionesPage() {
  const headerImage = await getSectionHeaderImage();
  const settings = await getSettings();
  const { returnWindowDays } = siteConfig.policies;

  return (
    <div>
      <SectionHeader crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Devoluciones' }]} title="Devoluciones" image={headerImage} />

      <div className="mx-auto max-w-3xl px-6 py-14">
        <ReturnRequestCard />

        <div className="prose-policy mt-14 space-y-5 text-sm leading-relaxed text-muted [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:text-ink">
          <h2>Garantía de calidad</h2>
          <p>
            Cada lote incluye su Certificado de Análisis (COA) con la pureza verificada por
            HPLC. Si un producto no cumple con las especificaciones indicadas en su COA,
            ofrecemos reemplazo o reembolso completo.
          </p>

          <h2>Plazo para solicitar una devolución</h2>
          <p>
            Tienes {returnWindowDays} días naturales a partir de la fecha de entrega confirmada
            para solicitar una devolución.
          </p>

          <h2>Casos elegibles</h2>
          <ul>
            <li>Producto dañado durante el envío.</li>
            <li>Producto incorrecto recibido.</li>
            <li>Producto que no cumple con la pureza indicada en su COA.</li>
            <li>Paquete extraviado por la paquetería (con comprobante).</li>
          </ul>

          <h2>Casos NO elegibles</h2>
          <ul>
            <li>Cambio de opinión después de abrir el producto.</li>
            <li>Almacenamiento incorrecto por parte del cliente.</li>
            <li>Producto ya reconstituido o parcialmente utilizado.</li>
            <li>Solicitudes después de {returnWindowDays} días naturales de la entrega.</li>
          </ul>

          <h2>Proceso paso a paso</h2>
          <ol>
            <li>Envía tu solicitud con el formulario de arriba (número de pedido, correo y motivo).</li>
            <li>Nuestro equipo evalúa tu caso — normalmente en 2-3 días hábiles.</li>
            <li>Te confirmamos la resolución por correo, incluyendo instrucciones si aplica.</li>
            <li>Una vez recibido el producto (cuando aplique), procesamos el reembolso o reemplazo.</li>
          </ol>

          <h2>Opciones de reembolso</h2>
          <p>
            Reemplazo del producto sin costo adicional, o reembolso al método de pago original.
            El reembolso se procesa al método de pago original una vez autorizada tu solicitud;
            los tiempos pueden variar según tu banco.
          </p>

          <h2>¿Llegó algo dañado o equivocado?</h2>
          <p>
            Escríbenos con foto del producto y foto del paquete (mostrando el número de guía)
            dentro del plazo de devolución — usa el formulario de arriba o escribe directo a{' '}
            {siteConfig.contact.email}.
          </p>

          <h2>¿Puedo cancelar o cambiar mi pedido después de comprarlo?</h2>
          <p>
            Solo mientras siga en proceso, antes de que se marque como enviado. Si ya se pagó y
            quieres cancelar, se procesa como una devolución/reembolso.
          </p>

          <h2>¿Qué pasa si hago un contracargo con el banco?</h2>
          <p>
            Te pedimos que cualquier problema se resuelva primero con nuestro equipo de soporte
            antes de ir al banco — así podemos atenderlo más rápido y evitar demoras.
          </p>

        </div>

        <div className="mt-10">
          <SupportContactCard
            title="¿Tienes dudas sobre tu devolución?"
            subtitle="Contáctanos y te ayudamos a resolver tu caso"
            whatsappNumber={settings.whatsappNumber}
            whatsappMessage="Hola, tengo una duda sobre una devolución."
            links={[
              { label: 'Ver política de envíos', href: '/envios' },
              { label: 'Términos y condiciones', href: '/terminos' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
