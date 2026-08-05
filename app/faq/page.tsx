import PolicyLayout from '@/components/PolicyLayout';
import { siteConfig } from '@/lib/site-config';
import Pending from '@/components/faq/Pending';
import FaqAccordion, { type FaqCategory } from '@/components/faq/FaqAccordion';

export const metadata = { title: `Preguntas Frecuentes | ${siteConfig.brand.name}` };

export default function FaqPage() {
  const { shippingCostMxn, shippingDaysMin, shippingDaysMax, returnWindowDays } = siteConfig.policies;

  const categories: FaqCategory[] = [
    {
      name: 'Preguntas Frecuentes',
      items: [
        {
          q: '¿Qué significa "Research Use Only" (RUO)?',
          searchText: 'research use only ruo investigacion laboratorio no medicamento',
          a: (
            <p>
              Significa que el producto es exclusivamente para investigación científica en
              laboratorio. No es un medicamento, suplemento ni producto de consumo humano o
              animal, y no está evaluado para diagnóstico, tratamiento o prevención de ninguna
              condición.
            </p>
          ),
        },
        {
          q: '¿Quién puede comprar?',
          searchText: 'quien puede comprar mayor de edad 18 años',
          a: (
            <p>
              Cualquier persona mayor de 18 años que confirme que el uso que le dará al producto
              es exclusivamente de investigación. Nos reservamos el derecho de rechazar pedidos
              con intención aparente de uso humano.
            </p>
          ),
        },
        {
          q: '¿Qué significan las presentaciones (5 mg, 10 mg, etc.)?',
          searchText: 'presentaciones mg dosis miligramos',
          a: (
            <p>
              Es la cantidad de péptido liofilizado (en polvo) que trae cada frasco. Presentaciones
              más altas suelen tener mejor precio por mg. Cada presentación tiene su propio precio,
              stock y foto — puedes elegirla directo en la tarjeta del producto o en su ficha.
            </p>
          ),
        },
        {
          q: '¿Cómo verifico la pureza de un lote?',
          searchText: 'pureza lote hplc coa certificado analisis',
          a: (
            <p>
              Cada producto indica su pureza declarada (HPLC) en la ficha del producto. Además,
              cuando el certificado de análisis (COA) de un lote está publicado, verás el botón
              "Ver Certificado de Análisis" en la página del producto.
            </p>
          ),
        },
        {
          q: '¿El empaque dice qué es lo que traigo?',
          searchText: 'empaque discreto logotipos contenido',
          a: <p>Empaque discreto: sin logotipos ni descripción del contenido en el exterior.</p>,
        },
        {
          q: '¿Qué pasa si necesito diluyente (agua bacteriostática)?',
          searchText: 'diluyente agua bacteriostatica reconstituir',
          a: (
            <p>
              Si agregas péptidos al carrito y no tienes agua bacteriostática en tu pedido, te lo
              recordamos con un banner en el carrito — agregarla es opcional, no obligatorio.
            </p>
          ),
        },
        {
          q: '¿Cómo uso mi código de descuento?',
          searchText: 'codigo descuento cupon checkout',
          a: (
            <p>
              Se ingresa en el paso de checkout, en el campo de cupón. Se valida y aplica antes de
              confirmar el pedido.
            </p>
          ),
        },
        {
          q: '¿Puedo usar un código de descuento después de haber pagado?',
          searchText: 'codigo descuento despues de pagar aplicar tarde',
          a: (
            <p>
              No, el código tiene que aplicarse antes de confirmar la compra, en el carrito o en el
              checkout. Si no lo usaste, sigue siendo válido para tu próxima compra.
            </p>
          ),
        },
        {
          q: '¿Tienen descuentos o promociones?',
          searchText: 'descuentos promociones newsletter ofertas',
          a: (
            <p>
              Sí — suscríbete a nuestro newsletter (verás un pop-up con {siteConfig.newsletter.discountPercent}%
              de descuento en tu primera compra) y síguenos en redes para futuras promociones.
            </p>
          ),
        },
        {
          q: '¿Puedo apartar un producto agotado?',
          searchText: 'producto agotado apartar notificarme stock',
          a: (
            <p>
              Sí — en la ficha de cualquier producto sin stock verás el botón "Notificarme cuando
              haya stock". Déjanos tu correo ahí y te avisamos apenas vuelva a haber inventario de
              esa presentación.
            </p>
          ),
        },
        {
          q: '¿Necesito crear una cuenta para comprar?',
          searchText: 'cuenta login registro invitado checkout',
          a: (
            <p>
              No. Compras como invitado, solo con tu correo y los datos de envío. Al finalizar tu
              compra te llega tu número de pedido — junto con tu correo, te sirve para rastrear el
              envío o solicitar una devolución en las secciones de arriba, sin necesidad de crear
              ni iniciar sesión en ninguna cuenta.
            </p>
          ),
        },
        {
          q: '¿Guardan mis datos de pago?',
          searchText: 'datos de pago tarjeta guardan seguridad',
          a: <p>No. Los datos de pago se procesan al momento de tu compra y no se guardan en nuestros servidores.</p>,
        },
        {
          q: '¿Cómo manejan mis datos personales?',
          searchText: 'datos personales privacidad aviso',
          a: (
            <p>
              Guardamos solo lo necesario para procesar tu pedido (nombre, correo, dirección,
              historial de compras) y no lo vendemos a terceros. Revisa el detalle completo en
              nuestro{' '}
              <a href="/privacidad" className="font-semibold text-primary">Aviso de Privacidad</a>.
            </p>
          ),
        },
        {
          q: '¿Son legales estos productos?',
          searchText: 'legales legalidad pais importar',
          a: (
            <p>
              Se venden únicamente para investigación científica. Es responsabilidad del cliente
              confirmar si el compuesto es legal de poseer/importar en su país o estado antes de
              comprar. No damos indicaciones de dosis ni de uso en humanos, porque eso sería
              inconsistente con ser "solo para investigación".
            </p>
          ),
        },
        {
          q: '¿Cómo los contacto?',
          searchText: 'contacto correo telefono horario soporte',
          a: (
            <p>
              Escríbenos a {siteConfig.contact.email} o llama al {siteConfig.contact.phone}, en
              horario {siteConfig.contact.hours} — o visita nuestra página de{' '}
              <a href="/contacto" className="font-semibold text-primary">Contacto</a>.
            </p>
          ),
        },
      ],
    },
    {
      name: 'Envíos y Entregas',
      items: [
        {
          q: '¿Cuánto cuesta el envío?',
          searchText: 'costo envio precio gratis',
          a: (
            <p>
              ${shippingCostMxn} MXN, con envío gratis en pedidos desde $
              {siteConfig.freeShippingThresholdMxn} MXN a toda la República Mexicana.
            </p>
          ),
        },
        {
          q: '¿Cuánto tarda en llegar mi pedido?',
          searchText: 'tiempo entrega dias habiles zona cdmx',
          a: (
            <p>
              Entre {shippingDaysMin} y {shippingDaysMax} días hábiles, dependiendo de tu zona —
              las entregas en CDMX y área metropolitana suelen estar en el rango más corto, y el
              resto del país en el rango más largo.
            </p>
          ),
        },
        {
          q: '¿Qué días hacen envíos?',
          searchText: 'dias de envio lunes viernes festivos',
          a: (
            <p>
              Procesamos y despachamos pedidos de lunes a viernes en días hábiles. No hacemos
              envíos en fin de semana ni días festivos.
            </p>
          ),
        },
        {
          q: '¿Cómo sigo mi pedido una vez enviado?',
          searchText: 'seguimiento pedido rastrear guia',
          a: (
            <p>
              Con tu número de pedido y correo en la pestaña{' '}
              <a href="/rastrea-pedido" className="font-semibold text-primary">Rastrea tu pedido</a>{' '}
              para verlo.
            </p>
          ),
        },
        {
          q: '¿A dónde hacen envíos?',
          searchText: 'cobertura envio republica mexicana otros paises internacional',
          a: <p>A toda la República Mexicana. Por ahora no enviamos a otros países.</p>,
        },
        {
          q: '¿Qué hago si mi paquete llega dañado o con el sello roto?',
          searchText: 'paquete danado sello roto abierto',
          a: (
            <p>
              Contáctanos de inmediato a {siteConfig.contact.email} con fotos del empaque — revisa
              también nuestra{' '}
              <a href="/devoluciones" className="font-semibold text-primary">política de devoluciones</a>.
            </p>
          ),
        },
        {
          q: '¿Puedo cambiar mi dirección después de comprar?',
          searchText: 'cambiar direccion despues de comprar',
          a: (
            <p>
              Solo si tu pedido sigue en proceso. Una vez que se marca como enviado ya no se puede
              modificar la dirección — contáctanos lo antes posible si necesitas hacer un cambio.
            </p>
          ),
        },
        {
          q: '¿Mi pedido llega en un solo paquete?',
          searchText: 'un solo paquete varios envios separados',
          a: (
            <p>
              No necesariamente. Si compras varios tipos de producto, pueden llegar en paquetes
              separados con números de rastreo distintos — es normal, no un error.
            </p>
          ),
        },
        {
          q: '¿Qué métodos de pago aceptan?',
          searchText: 'metodos de pago tarjeta spei transferencia cripto',
          a: (
            <div>
              <Pending>
                los métodos de pago reales que acepta Nexa Labs (tarjeta, SPEI, cripto, etc.) para
                publicarlos aquí.
              </Pending>
            </div>
          ),
        },
        {
          q: '¿Envían a apartados postales o direcciones militares?',
          searchText: 'apartado postal direccion militar po box',
          a: (
            <div>
              <Pending>si Nexa Labs envía a apartados postales o direcciones militares y con qué paquetería.</Pending>
            </div>
          ),
        },
      ],
    },
    {
      name: 'Calidad y Laboratorio',
      items: [
        {
          q: '¿Prueban sus productos?',
          searchText: 'prueban productos laboratorio externo independiente hplc',
          a: (
            <div>
              <p>
                Sí, cada lote se envía a un laboratorio externo independiente para su análisis
                (HPLC u otros métodos según el compuesto) antes de ponerse a la venta.
              </p>
              <Pending>el nombre del laboratorio (o laboratorios) que usa Nexa Labs para estos análisis.</Pending>
            </div>
          ),
        },
        {
          q: '¿Qué tan cerca debe estar la cantidad de lo que dice la etiqueta?',
          searchText: 'tolerancia cantidad etiqueta variacion porcentaje',
          a: (
            <div>
              <p>
                Aceptamos una variación dentro de un rango definido, arriba o abajo de lo indicado
                en la etiqueta. Si un lote sale fuera de ese rango, se detiene y se revisa antes de
                venderse.
              </p>
              <Pending>el % de tolerancia exacto que usa Nexa Labs (SwissChems, por ejemplo, usa 10%).</Pending>
            </div>
          ),
        },
        {
          q: '¿La pureza se reporta igual para todos los productos?',
          searchText: 'pureza igual mezclas componentes',
          a: (
            <p>
              No necesariamente. Los péptidos liofilizados llevan un número exacto de pureza. Las
              mezclas con varios compuestos activos no llevan un solo porcentaje: se evalúa cada
              componente por separado.
            </p>
          ),
        },
        {
          q: '¿Qué miden realmente los reportes de laboratorio?',
          searchText: 'que miden reportes laboratorio pureza contenido',
          a: (
            <p>
              Dos cosas distintas: pureza (qué tan limpio está el compuesto) y contenido (si la
              cantidad real coincide con lo indicado en la etiqueta). Un lote debe pasar ambas
              pruebas.
            </p>
          ),
        },
        {
          q: '¿De dónde sale el margen de tolerancia que usan?',
          searchText: 'margen tolerancia estandar usp criterio',
          a: (
            <div>
              <p>Depende del estándar que sigue el laboratorio que realiza el análisis.</p>
              <Pending>
                si Nexa Labs sigue algún estándar publicado (ej. USP) o un criterio interno propio,
                para explicarlo aquí.
              </Pending>
            </div>
          ),
        },
        {
          q: '¿Por qué algunas presentaciones varían más que otras?',
          searchText: 'variacion presentaciones polvo a granel',
          a: (
            <p>
              Porque al repartir una cantidad pequeña de compuesto entre muchas unidades, cada una
              puede quedar un poco arriba o abajo del promedio — como servir cucharadas de una
              misma bolsa. El polvo a granel no tiene ese problema porque se pesa de una sola vez.
            </p>
          ),
        },
        {
          q: '¿Por qué algunos certificados muestran un rango en vez de un número exacto?',
          searchText: 'certificados rango numero exacto formato',
          a: (
            <p>
              Depende del laboratorio: algunos reportan en rangos (por ejemplo, 98%+ significa
              entre 98% y 100%) en vez de un decimal exacto. No es peor calidad, es solo otro
              formato de reporte.
            </p>
          ),
        },
        {
          q: '¿Qué incluye un Certificado de Análisis (COA)?',
          searchText: 'que incluye coa certificado analisis lote metodo laboratorio',
          a: (
            <p>
              El nombre del compuesto, el número de lote, el porcentaje de pureza, el método usado
              y el laboratorio que lo emitió. No nos autocertificamos: siempre es un laboratorio
              externo sin relación comercial con nosotros. Puedes verlo en la ficha de cada
              producto, en el botón "Ver Certificado de Análisis".
            </p>
          ),
        },
        {
          q: '¿Qué garantía ofrecen si un resultado no coincide?',
          searchText: 'garantia resultado no coincide prueba independiente',
          a: (
            <div>
              <Pending>
                qué pasa si una prueba independiente del cliente no coincide con la pureza
                indicada — por ejemplo, reembolso del pedido y/o del costo de la prueba.
              </Pending>
            </div>
          ),
        },
        {
          q: '¿Por qué el resultado no es exactamente 100%?',
          searchText: 'no es exactamente 100 por ciento variacion normal',
          a: (
            <p>
              Porque ninguna medición real es perfecta: hay variación normal en cada paso del
              proceso de análisis. Un resultado cercano a 100%, dentro del rango aceptado, es
              justamente lo que se espera de datos de laboratorio reales.
            </p>
          ),
        },
      ],
    },
    {
      name: 'Péptidos: Manejo y Almacenamiento',
      items: [
        {
          q: '¿En qué forma vienen los péptidos?',
          searchText: 'forma polvo liofilizado agua bacteriostatica aparte',
          a: (
            <p>
              En polvo liofilizado (deshidratado por congelación). No incluyen el agua
              bacteriostática para reconstituirlos — eso se compra aparte.
            </p>
          ),
        },
        {
          q: '¿Cómo se deben guardar?',
          searchText: 'como guardar almacenar refrigerar congelar temperatura',
          a: (
            <p>
              A temperatura ambiente aguantan días o semanas sin abrir. Para guardarlos más tiempo
              se recomienda refrigerar (4°C), y para guardarlos mucho tiempo, congelar (-20°C) —
              siempre protegidos de la luz.
            </p>
          ),
        },
        {
          q: '¿Cuánto duran los péptidos liofilizados?',
          searchText: 'cuanto duran caducidad vida util meses',
          a: (
            <div>
              <Pending>
                la vida útil real de los péptidos de Nexa Labs bien almacenados (SwissChems indica
                hasta 24 meses).
              </Pending>
            </div>
          ),
        },
        {
          q: '¿Cómo se identifican los frascos?',
          searchText: 'identificacion frascos color tapon etiqueta',
          a: (
            <div>
              <Pending>
                si Nexa Labs usa algún sistema de identificación por frasco (ej. color de tapón,
                etiqueta con número de lote).
              </Pending>
            </div>
          ),
        },
        {
          q: '¿Sus soluciones líquidas contienen alcohol?',
          searchText: 'soluciones liquidas alcohol composicion l-carnitina lipo-c',
          a: (
            <div>
              <Pending>
                la composición exacta de los productos líquidos (L-Carnitina, Lipo-C, agua
                bacteriostática) — si contienen alcohol bencílico u otro conservador.
              </Pending>
            </div>
          ),
        },
      ],
    },
    {
      name: 'Recompensas y Mayoreo',
      items: [
        {
          q: '¿Tienen programa de recompensas?',
          searchText: 'programa recompensas puntos descuento recurrente',
          a: (
            <div>
              <Pending>si Nexa Labs va a ofrecer puntos o descuentos por compra recurrente.</Pending>
            </div>
          ),
        },
        {
          q: '¿Tienen programa de afiliados?',
          searchText: 'programa afiliados comision registro',
          a: (
            <div>
              <Pending>si aplica un programa de afiliados, con qué comisión y proceso de registro.</Pending>
            </div>
          ),
        },
        {
          q: '¿Tienen precios de mayoreo?',
          searchText: 'precios mayoreo volumen distribuidor',
          a: (
            <div>
              <Pending>si existe un canal de ventas por volumen/mayoreo y sus condiciones.</Pending>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <PolicyLayout title="Preguntas Frecuentes">
      <div className="not-prose">
        <FaqAccordion categories={categories} />
      </div>

      <div className="not-prose mt-10 rounded-theme border border-border bg-surface px-6 py-6 text-center">
        <p className="mb-1 text-sm font-semibold text-ink">¿Tienes más dudas?</p>
        <p className="text-sm text-muted">
          Escríbenos a {siteConfig.contact.email} o al {siteConfig.contact.phone}, horario{' '}
          {siteConfig.contact.hours}.
        </p>
      </div>
    </PolicyLayout>
  );
}
