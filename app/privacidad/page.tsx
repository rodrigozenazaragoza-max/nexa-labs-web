// Se regenera cada 5 min y se sirve desde caché — el catálogo no cambia
// por visitante, así que no hay razón para renderizar de cero en cada clic.
export const revalidate = 300;

import PolicyLayout from '@/components/PolicyLayout';
import { siteConfig } from '@/lib/site-config';

export const metadata = { title: `Política de Privacidad | ${siteConfig.brand.name}` };

export default function PrivacidadPage() {
  return (
    <PolicyLayout title="Política de Privacidad" contactQuestion="¿Tienes preguntas sobre privacidad?">
      <p>
        En {siteConfig.brand.name} respetamos tu privacidad. Este aviso
        describe qué datos personales recabamos, con qué finalidad y cómo
        puedes ejercer tus derechos, en cumplimiento con la Ley Federal de
        Protección de Datos Personales en Posesión de los Particulares
        (LFPDPPP).
      </p>

      <h2>1. Datos que recopilamos</h2>
      <p>Recabamos la información que nos proporcionas directamente:</p>
      <ul>
        <li>Datos de contacto: nombre, correo electrónico, teléfono.</li>
        <li>Datos de envío: dirección de entrega.</li>
        <li>Datos de pedido: productos, cantidades, historial de compra.</li>
        <li>Datos de pago: procesados directamente por nuestra pasarela de pago — no almacenamos números de tarjeta completos en nuestros servidores.</li>
        <li>Correo electrónico proporcionado voluntariamente para recibir promociones (formulario de suscripción).</li>
      </ul>

      <h2>2. Finalidad del tratamiento</h2>
      <p>Usamos tus datos para:</p>
      <ul>
        <li>Procesar, enviar y dar seguimiento a tu pedido.</li>
        <li>Comunicarnos contigo sobre el estado de tu compra.</li>
        <li>Responder consultas y brindar soporte.</li>
        <li>Enviarte promociones, únicamente si te suscribiste voluntariamente (puedes darte de baja en cualquier momento).</li>
        <li>Cumplir obligaciones legales y prevenir fraude.</li>
      </ul>
      <p>No vendemos ni rentamos tu información personal a terceros.</p>

      <h2>3. Derechos ARCO</h2>
      <p>
        Puedes solicitar en cualquier momento el Acceso, Rectificación,
        Cancelación u Oposición (derechos ARCO) al tratamiento de tus datos
        personales, así como revocar tu consentimiento, escribiendo a{' '}
        {siteConfig.contact.email}.
      </p>

      <h2>4. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y administrativas razonables para
        proteger tus datos contra acceso no autorizado, pérdida o
        alteración. Ningún sistema es 100% infalible; te recomendamos
        también proteger tus propias credenciales de acceso.
      </p>

      <h2>5. Cambios a este aviso</h2>
      <p>
        Podemos actualizar esta política periódicamente. La fecha de última
        actualización se indica al inicio de esta página.
      </p>

      <h2>6. Contacto</h2>
      <p>{siteConfig.contact.email} · {siteConfig.contact.phone}</p>
    </PolicyLayout>
  );
}
