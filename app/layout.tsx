import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { createClient } from '@/lib/supabase/server';
import SiteChrome from '@/components/SiteChrome';
import { siteConfig } from '@/lib/site-config';
import { getBestsellers } from '@/lib/bestsellers';
import { getSiteSettings } from '@/lib/get-settings';

export const metadata: Metadata = {
  title: `${siteConfig.brand.name} | Péptidos de Investigación`,
  description: 'Péptidos de investigación (RUO) con COA por lote. Para uso exclusivo en investigación científica.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: diluentProduct } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('slug', siteConfig.diluent.slug)
    .maybeSingle();

  // Pool de productos para el upsell "Recomendados para tu investigación"
  // dentro del carrito — ahora ordenado por ventas reales (no alfabético),
  // igual que "Más vendidos" en el home. Se filtra el que ya está en el
  // carrito ahí mismo, y el diluyente (agua bacteriostática) aquí también
  // porque ya tiene su propio recordatorio dedicado (DiluentReminder).
  const recommendedPool = await getBestsellers(supabase, 8, siteConfig.diluent.slug);
  const settings = await getSiteSettings(supabase);

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
          <SiteChrome diluentProduct={diluentProduct ?? null} recommendedPool={recommendedPool} whatsappNumber={settings.whatsappNumber} whatsappMessage={settings.whatsappMessage}>
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
