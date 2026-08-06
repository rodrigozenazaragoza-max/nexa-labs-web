import PolicyLayout from '@/components/PolicyLayout';
import { siteConfig } from '@/lib/site-config';

export const metadata = { title: `Envíos y Entregas | ${siteConfig.brand.name}` };

export default function EnviosPage() {
  const { shippingCostMxn, shippingDaysMin, shippingDaysMax } = siteConfig.policies;

  return (
    <PolicyLayout title="Envíos y Entregas">
      <h2>Nuestro envío</h2>
      <p>
        Realizamos envío a toda la República Mexicana con un costo de $
        {shippingCostMxn} MXN, gratis en pedidos a partir de $
        {siteConfig.freeShippingThresholdMxn} MXN. Tiempo estimado de
        entrega: {shippingDaysMin}–{shippingDaysMax} días hábiles según zona.
      </p>
      <ul>
        <li>Empaque discreto — sin logotipos ni indicaciones del contenido en el exterior.</li>
        <li>Número de guía y rastreo enviado por correo/WhatsApp.</li>
        <li>Embalaje protegido para preservar la integridad del producto.</li>
      </ul>

      <h2>Preparación y horarios</h2>
      <p>
        Los pedidos confirmados antes de las {siteConfig.policies.orderCutoffTime} en un día
        hábil se preparan y envían ese mismo día. Pedidos posteriores o en
        fin de semana se procesan el siguiente día hábil.
      </p>

      <h2>Cobertura</h2>
      <p>
        Entregamos en las 32 entidades de México. Zonas extendidas o de
        difícil acceso pueden tener 1–2 días adicionales.
      </p>

      <h2>Paquete dañado o extraviado</h2>
      <p>
        Si tu pedido llega dañado o no llega dentro del plazo estimado,
        contáctanos con tu número de guía en {siteConfig.contact.email} y
        gestionamos reposición o reembolso según nuestra{' '}
        <a href="/devoluciones" className="text-primary">política de devoluciones</a>.
      </p>

      <h2>Contacto</h2>
      <p>{siteConfig.contact.email} · {siteConfig.contact.phone}</p>
    </PolicyLayout>
  );
}
