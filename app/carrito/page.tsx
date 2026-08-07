import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import CartList from '@/components/CartList';
import SectionHeader from '@/components/SectionHeader';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { getBestsellersCached, getDiluentProduct } from '@/lib/data';

export default async function CarritoPage() {
  // Todo sale de las consultas memoizadas que el layout ya hizo en esta
  // misma petición — cero viajes extra a Supabase.
  const [diluentProduct, recommendedPool, headerImage] = await Promise.all([
    getDiluentProduct(),
    getBestsellersCached(8, siteConfig.diluent.slug),
    getSectionHeaderImage(),
  ]);

  return (
    <div>
      <SectionHeader crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Carrito' }]} title="Tu carrito" image={headerImage} />
      <div className="mx-auto max-w-2xl px-6 py-14">
        <div className="rounded-theme border border-border">
          <CartList diluentProduct={diluentProduct ?? null} recommendedPool={recommendedPool ?? []} />
        </div>
        <Link
          href="/checkout"
          className="mt-6 inline-block rounded-theme bg-primary px-6 py-3 font-semibold text-white"
        >
          Ir a checkout →
        </Link>
      </div>
    </div>
  );
}
