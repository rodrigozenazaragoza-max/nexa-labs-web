// ============================================================
// CONFIGURACIÓN DEL SITIO — edita este archivo para cambiar
// TODOS los textos del sitio sin tocar componentes ni JSX.
// ============================================================

export const siteConfig = {
  brand: {
    name: 'Nexa Labs',
    tagline: 'PREMIUM PEPTIDES',
  },
  contact: {
    email: 'contacto@nexalabs.mx',
    phone: '+52 622 119 3067',
    whatsappNumber: '526221193067', // solo dígitos, con código de país
    hours: 'Lunes — Viernes, 9:00 AM – 6:00 PM CST',
    address: 'México',
  },
  announcementBar: {
    freeShippingText: 'Envío gratis en pedidos mayores a $1,999 a toda la República Mexicana.',
    discreteText: 'Empaque 100% discreto',
  },
  complianceBar: {
    text: 'SOLO PARA USO EN INVESTIGACIÓN — NO PARA CONSUMO HUMANO O ANIMAL',
  },
  hero: {
    badge: '99% de pureza garantizada',
    titleLine1: 'Calidad Verificada',
    titleLine2Accent: 'Entrega Confiable',
    titleLine3: 'Recibe en 24–72 Horas.',
    ctaPrimary: 'Ver productos',
    ctaSecondary: 'Hablar con ventas',
    // Slugs de los productos que se muestran con foto en el hero de la
    // home. Cambia esta lista para destacar otros productos — el
    // componente jala la foto y el nombre directo de Supabase.
    featuredProductSlugs: ['retatrutida', 'mots-c'],
  },
  trustBar: [
    { icon: 'truck', title: 'Envío gratis y rápido', desc: 'Envío gratis en pedidos a partir de $1,999 MXN.' },
    { icon: 'headset', title: 'Soporte 24/7', desc: 'Estamos disponibles las 24 horas, 7 días a la semana.' },
    { icon: 'file', title: 'COA por terceros', desc: 'Todos nuestros lotes cuentan con certificados de análisis de laboratorios independientes.' },
    { icon: 'shield', title: 'Compra 100% segura', desc: 'Tu información y pago están protegidos.' },
  ],
  categories: [
    { icon: 'scale', name: 'Metabolismo', desc: 'Péptidos que apoyan el control de peso y la composición corporal.' },
    { icon: 'workflow', name: 'Hormonal', desc: 'Regulación hormonal y equilibrio del organismo.' },
    { icon: 'infinity', name: 'Longevidad', desc: 'Apoyo al envejecimiento saludable y optimización celular.' },
    { icon: 'activity', name: 'Recuperación', desc: 'Apoyo para la recuperación, energía y rendimiento físico.' },
    { icon: 'brain', name: 'Cognición', desc: 'Mejora de la función cerebral, enfoque y claridad mental.' },
    { icon: 'shield', name: 'Bioreguladores', desc: 'Regulación fina de procesos celulares específicos.' },
    { icon: 'user', name: 'Estética', desc: 'Salud de la piel, cabello y procesos de regeneración celular.' },
  ],
  newsletter: {
    headline: 'Obtén 10% de descuento',
    subheadline: 'Suscríbete y recibe tu código de descuento, además de futuras promociones.',
    discountPercent: 10,
    discountCode: 'BIENVENIDO10',
  },
  diluent: {
    slug: 'agua-bacteriostatica',
  },
  policies: {
    shippingCostMxn: 200,
    shippingDaysMin: 1,
    shippingDaysMax: 4,
    returnWindowDays: 30,
    // ⚠️ DATOS LEGALES — llénalos con la información real de tu empresa
    // antes de considerar los Términos como definitivos. Mientras estén
    // vacíos, la página de Términos muestra un aviso amarillo señalándolo.
    legalName: '', // ej. 'Nexa Labs S.A. de C.V.'
    legalAddress: '', // ej. 'Hermosillo, Sonora, México'
    jurisdiction: '', // ej. 'Hermosillo, Sonora'
    termsUpdated: '6 de agosto de 2026',
    // Hora límite para que un pedido salga el mismo día hábil.
    orderCutoffTime: '5:00 PM',
  },
  freeShippingThresholdMxn: 1999,
};
