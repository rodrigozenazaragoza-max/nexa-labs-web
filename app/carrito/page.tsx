import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import CartList from '@/components/CartList';
import SectionHeader from '@/components/SectionHeader';
import { getSectionHeaderImage } from '@/lib/section-header-image';

export default async function CarritoPage() {
  const supabase = createClient();
  const { data: diluentProduct } = await supabase
    .from('products')
    .select('*')
    .eq('slug', siteConfig.diluent.slug)
    .maybeSingle();

  const { data: recommendedPool } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .neq('slug', siteConfig.diluent.slug)
    .order('name')
    .limit(8);
  const headerImage = await getSectionHeaderImage(supabase);

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
