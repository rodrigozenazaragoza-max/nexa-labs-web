import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import SiteChrome from '@/components/SiteChrome';
import { siteConfig } from '@/lib/site-config';
import { getBestsellersCached, getDiluentProduct, getSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: `${siteConfig.brand.name} | Péptidos de Investigación`,
  description: 'Péptidos de investigación (RUO) con COA por lote. Para uso exclusivo en investigación científica.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Las tres cargas corren EN PARALELO (antes eran tres esperas seguidas) y
  // comparten las mismas consultas memoizadas de lib/data.ts. El layout se
  // ejecuta en cada navegación, así que aquí es donde más se nota.
  //
  // recommendedPool alimenta el upsell "Recomendados para tu investigación"
  // del carrito, ordenado por ventas reales. Se excluye el diluyente porque
  // ya tiene su propio recordatorio dedicado (DiluentReminder).
  const [diluentProduct, recommendedPool, settings] = await Promise.all([
    getDiluentProduct(),
    getBestsellersCached(8, siteConfig.diluent.slug),
    getSettings(),
  ]);

  return (
    <html lang="es">
      <head>
        {/* Cambia esta fuente por otra de Google Fonts si quieres — actualiza
            también --font-heading / --font-body en app/globals.css */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <SiteChrome diluentProduct={diluentProduct} recommendedPool={recommendedPool} whatsappNumber={settings.whatsappNumber} whatsappMessage={settings.whatsappMessage}>
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
