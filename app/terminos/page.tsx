import PolicyLayout from '@/components/PolicyLayout';
import { siteConfig } from '@/lib/site-config';

export const metadata = { title: `Términos y Condiciones | ${siteConfig.brand.name}` };

export default function TerminosPage() {
  return (
    <PolicyLayout title="Términos y Condiciones">
      <p>
        Estos términos rigen el uso del sitio web y la compra de productos de{' '}
        {siteConfig.brand.name}. Al usar este sitio o realizar un pedido, aceptas
        las condiciones descritas a continuación.
      </p>

      <h2>1. Naturaleza de los productos</h2>
      <p>
        Todos los productos ofrecidos son compuestos de referencia para
        investigación científica (RUO — Research Use Only). No son
        medicamentos, suplementos, cosméticos ni productos de consumo
        humano. No están aprobados por ninguna autoridad sanitaria para
        diagnóstico, tratamiento, cura ni prevención de enfermedad alguna.
      </p>

      <h2>2. Declaraciones del comprador</h2>
      <p>Al comprar, declaras y garantizas que:</p>
      <ul>
        <li>Eres mayor de 18 años.</li>
        <li>Adquieres los productos exclusivamente para investigación científica en un entorno controlado.</li>
        <li>No introducirás los productos en el cuerpo humano o animal bajo ninguna circunstancia.</li>
        <li>No revenderás los productos como productos de consumo.</li>
        <li>Cumplirás con todas las leyes y regulaciones aplicables en tu jurisdicción.</li>
      </ul>

      <h2>3. Precios y disponibilidad</h2>
      <p>
        Los precios se muestran en pesos mexicanos (MXN) e incluyen los
        impuestos aplicables salvo que se indique lo contrario. Nos
        reservamos el derecho de modificar precios y disponibilidad sin
        previo aviso.
      </p>

      <h2>4. Limitación de responsabilidad</h2>
      <p>
        {siteConfig.brand.name} no se hace responsable por el uso indebido
        de los productos, incluyendo cualquier uso fuera del contexto de
        investigación de laboratorio declarado por el comprador. [Sección a
        completar con tu asesor legal — esta cláusula suele incluir límites
        de responsabilidad específicos y no debe dejarse genérica.]
      </p>

      <h2>5. Rechazo de pedidos</h2>
      <p>
        Nos reservamos el derecho de rechazar o cancelar cualquier pedido en
        el que la intención declarada o aparente sea el consumo humano o
        animal.
      </p>

      <h2>6. Jurisdicción</h2>
      <p>
        Estos términos se rigen por las leyes de México. Cualquier disputa
        se someterá a los tribunales competentes de {siteConfig.policies.jurisdiction}.
      </p>

      <h2>7. Contacto</h2>
      <p>
        {siteConfig.contact.email} · {siteConfig.contact.phone}
      </p>
    </PolicyLayout>
  );
}
