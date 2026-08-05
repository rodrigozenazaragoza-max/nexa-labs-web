'use client';

import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import AgeGate from './AgeGate';
import CartDrawer from './CartDrawer';
import NewsletterModal from './NewsletterModal';
import type { Product } from '@/lib/types';

// El panel /admin es una herramienta interna — no debe llevar age gate,
// popup de newsletter, nav pública ni carrito. Este wrapper centraliza esa
// decisión en un solo lugar en vez de tocar cada componente.
export default function SiteChrome({
  children,
  diluentProduct,
  recommendedPool,
  whatsappNumber,
  whatsappMessage,
}: {
  children: React.ReactNode;
  diluentProduct: Product | null;
  recommendedPool: Product[];
  whatsappNumber: string;
  whatsappMessage: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <AgeGate />
      <NewsletterModal />
      <CartDrawer diluentProduct={diluentProduct} recommendedPool={recommendedPool} />
      <TopBar />
      <Header />
      <main>{children}</main>
      <Footer whatsappNumber={whatsappNumber} whatsappMessage={whatsappMessage} />
    </>
  );
}
