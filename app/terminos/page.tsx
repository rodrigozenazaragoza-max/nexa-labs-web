import PolicyLayout from '@/components/PolicyLayout';
import Pending from '@/components/faq/Pending';
import { siteConfig } from '@/lib/site-config';

export const metadata = { title: `Términos y Condiciones | ${siteConfig.brand.name}` };

// BORRADOR PARA REVISIÓN LEGAL.
// Este documento se amplió tomando como referencia la estructura que usan
// las tiendas serias de péptidos RUO en México (peptide.com.mx,
// brutal-rx.com). Cubre los temas que un contrato de venta en línea suele
// necesitar, PERO no sustituye la revisión de un abogado mexicano — en
// particular las cláusulas de limitación de responsabilidad (§11) y
// jurisdicción (§13), que dependen de la constitución real de la empresa.
//
// Los datos de la entidad legal viven en lib/site-config.ts (legalName,
// legalAddress, jurisdiction). Mientras estén vacíos, la página muestra
// avisos amarillos en su lugar — así nunca se publica un placeholder crudo.
const { legalName, legalAddress, jurisdiction, termsUpdated } = siteConfig.policies;

export default function TerminosPage() {
  return (
    <PolicyLayout
      title="Términos y Condiciones"
      updated={termsUpdated}
      contactQuestion="¿Tienes preguntas sobre estos términos?"
    >
      <p>
        Estos Términos y Condiciones regulan el acceso, la navegación y el uso de la tienda en
        línea de {siteConfig.brand.name}, así como la compra de los productos que en ella se
        ofrecen. Al acceder al sitio, registrarte o completar cualquier pedido, aceptas de forma
        íntegra y expresa lo aquí establecido. Si no estás de acuerdo con alguna de estas
        cláusulas, te pedimos no utilizar el sitio.
      </p>

      <h2>1. Identidad del titular</h2>
      {legalName && legalAddress ? (
        <p>
          Este sitio es operado por <strong>{legalName}</strong>, con domicilio en {legalAddress}.
          Puedes contactarnos en {siteConfig.contact.email} o al {siteConfig.contact.phone}.
        </p>
      ) : (
        <>
          <p>
            Este sitio es operado por {siteConfig.brand.name}. Puedes contactarnos en{' '}
            {siteConfig.contact.email} o al {siteConfig.contact.phone}.
          </p>
          <Pending>
            falta la razón social completa y el domicilio fiscal de la empresa. Llénalos en{' '}
            <code>lib/site-config.ts</code> (campos <code>legalName</code> y{' '}
            <code>legalAddress</code>). Sin esta información, la cláusula de jurisdicción queda sin
            anclaje legal.
          </Pending>
        </>
      )}

      <h2>2. Naturaleza de los productos (RUO)</h2>
      <p>
        Todos los productos ofrecidos son compuestos de referencia para investigación científica
        (RUO — <em>Research Use Only</em>). <strong>No son medicamentos, suplementos alimenticios,
        cosméticos ni productos de consumo humano.</strong> No han sido aprobados por COFEPRIS,
        FDA, EMA ni ninguna otra autoridad sanitaria para diagnóstico, tratamiento, cura,
        prevención de enfermedad alguna, ni para administración en humanos o animales.
      </p>
      <p>
        Ningún contenido de este sitio —incluidas descripciones de producto, fichas técnicas,
        artículos, herramientas de cálculo o comunicaciones de soporte— constituye asesoría médica,
        farmacológica, legal o profesional de ningún tipo.
      </p>

      <h2>3. Declaraciones del comprador</h2>
      <p>Al realizar un pedido, declaras y garantizas bajo protesta de decir verdad que:</p>
      <ul>
        <li>Eres mayor de 18 años y cuentas con capacidad legal para contratar.</li>
        <li>Adquieres los productos exclusivamente para investigación científica en un entorno controlado.</li>
        <li>No introducirás los productos en el cuerpo humano o animal bajo ninguna circunstancia.</li>
        <li>No revenderás los productos como productos de consumo, medicamentos ni suplementos.</li>
        <li>Conoces la naturaleza del producto que adquieres y has consultado la literatura científica relevante.</li>
        <li>Almacenarás el producto conforme a las condiciones indicadas en su ficha técnica.</li>
        <li>Dispondrás y desecharás de forma responsable el material no utilizado.</li>
        <li>Cumplirás con todas las leyes y regulaciones aplicables en tu jurisdicción.</li>
      </ul>
      <p>
        {siteConfig.brand.name} se reserva el derecho de solicitar identificación oficial en casos
        justificados para verificar la mayoría de edad.
      </p>

      <h2>4. Cuenta de usuario</h2>
      <p>
        Para agilizar tus compras puedes crear una cuenta. Eres responsable de proporcionar
        información veraz y actualizada, y de mantener la confidencialidad de tus credenciales de
        acceso. Toda actividad realizada desde tu cuenta será de tu responsabilidad exclusiva. Si
        detectas un acceso no autorizado, notifícanos de inmediato a {siteConfig.contact.email}.
      </p>
      <p>
        Los datos de tu tarjeta nunca se almacenan en nuestros servidores: se procesan y resguardan
        directamente por nuestra pasarela de pago certificada.
      </p>

      <h2>5. Proceso de compra</h2>
      <p>
        Agregar productos al carrito no constituye una compra. El contrato de compraventa se
        perfecciona únicamente cuando el pago es aprobado y {siteConfig.brand.name} confirma el
        pedido por correo electrónico con su número de referencia.
      </p>
      <p>
        Nos reservamos el derecho de cancelar cualquier pedido cuando exista sospecha razonable de
        fraude, datos falsos o irregularidades en la transacción, así como cuando la intención
        declarada o aparente del comprador sea el consumo humano o animal. En estos casos se
        reembolsará el importe cobrado.
      </p>

      <h2>6. Precios</h2>
      <p>
        Los precios se muestran en pesos mexicanos (MXN) e incluyen los impuestos aplicables salvo
        que se indique lo contrario. Podemos modificar precios en cualquier momento y sin previo
        aviso; sin embargo, <strong>todo pedido ya confirmado y pagado se respeta al precio vigente
        al momento de la compra.</strong>
      </p>
      <p>
        En caso de un error evidente de precio o de descripción, nos reservamos el derecho de
        cancelar el pedido afectado y reembolsar íntegramente el importe cobrado, notificándote por
        correo.
      </p>

      <h2>7. Disponibilidad y agotamiento de existencias</h2>
      <p>
        La disponibilidad está sujeta al inventario real al momento de confirmar el pago. Si un
        producto se agota entre el momento del pedido y su preparación, te contactaremos para
        ofrecerte, a tu elección: el reembolso completo de ese artículo, su canje por otro producto
        de valor equivalente, o la espera hasta el siguiente lote disponible.
      </p>

      <h2>8. Códigos de descuento</h2>
      <p>
        Los códigos promocionales son personales, de un solo uso salvo que se indique lo contrario,
        no son canjeables por efectivo y no son acumulables entre sí. Un código utilizado en un
        pedido pagado no puede reutilizarse, aun si el pedido se cancela posteriormente.
      </p>

      <h2>9. Envíos</h2>
      <p>
        Los envíos se rigen por nuestra{' '}
        <a href="/envios" className="font-semibold text-primary">Política de Envíos</a>, que forma
        parte integrante de estos términos. Los plazos de entrega publicados son estimados y
        dependen de la paquetería. {siteConfig.brand.name} no se responsabiliza por retrasos
        atribuibles a terceros, incluyendo demoras de las empresas de mensajería, caso fortuito,
        fuerza mayor, condiciones climáticas o bloqueos.
      </p>

      <h2>10. Cambios y devoluciones</h2>
      <p>
        Los cambios y devoluciones se rigen por nuestra{' '}
        <a href="/devoluciones" className="font-semibold text-primary">Política de Devoluciones</a>,
        que forma parte integrante de estos términos. Por tratarse de compuestos sensibles a la
        temperatura y la manipulación, aplican condiciones específicas que se detallan en ese
        documento.
      </p>

      <h2>11. Limitación de responsabilidad</h2>
      <p>
        {siteConfig.brand.name} limita su responsabilidad, en todo caso, al valor del producto
        adquirido. No asumimos responsabilidad alguna por el uso indebido de los productos,
        incluyendo cualquier uso fuera del contexto de investigación declarado por el comprador, ni
        por daños indirectos, incidentales, consecuenciales o lucro cesante derivados del uso del
        sitio o de los productos. El uso de los productos es responsabilidad exclusiva del
        comprador.
      </p>
      <Pending>
        esta cláusula es un borrador y debe ser revisada por tu abogado antes de considerarse
        definitiva. Los límites de responsabilidad válidos dependen de la figura legal de tu
        empresa y de la legislación aplicable en materia de protección al consumidor.
      </Pending>

      <h2>12. Propiedad intelectual</h2>
      <p>
        Todo el contenido de este sitio —textos, fotografías de producto, certificados de análisis,
        gráficos, identidad visual, logotipos, herramientas y código— es propiedad de{' '}
        {siteConfig.brand.name} o de sus licenciantes. Queda prohibida su reproducción,
        distribución o uso total o parcial sin autorización previa por escrito, salvo la cita
        académica con atribución correcta a la fuente.
      </p>

      <h2>13. Legislación aplicable y jurisdicción</h2>
      {jurisdiction ? (
        <p>
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para la
          interpretación y cumplimiento de los mismos, las partes se someten expresamente a la
          jurisdicción de los tribunales competentes de {jurisdiction}, renunciando a cualquier otro
          fuero que pudiera corresponderles.
        </p>
      ) : (
        <>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.
          </p>
          <Pending>
            falta definir la ciudad y estado cuyos tribunales serán competentes ante cualquier
            controversia. Llénalo en <code>lib/site-config.ts</code> (campo{' '}
            <code>jurisdiction</code>) — normalmente corresponde al domicilio fiscal de la empresa,
            pero confírmalo con tu abogado.
          </Pending>
        </>
      )}

      <h2>14. Modificaciones a estos términos</h2>
      <p>
        Podemos modificar estos Términos y Condiciones en cualquier momento. La versión vigente será
        siempre la publicada en esta página, con su fecha de última actualización visible. Cuando el
        cambio sea material, lo notificaremos con al menos 15 días naturales de anticipación al
        correo registrado de nuestros clientes. El uso continuado del sitio tras la entrada en vigor
        de un cambio implica su aceptación.
      </p>

      <h2>15. Contacto</h2>
      <p>
        {siteConfig.contact.email} · {siteConfig.contact.phone} · {siteConfig.contact.hours}
      </p>
    </PolicyLayout>
  );
}
