import { createClient } from '@/lib/supabase/server';
import CatalogGrid from '@/components/CatalogGrid';
import SectionHeader from '@/components/SectionHeader';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import type { Product } from '@/lib/types';

export default async function CatalogPage() {
  const supabase = createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .order('name');
  const headerImage = await getSectionHeaderImage(supabase);

  return (
    <div>
      <SectionHeader
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Productos' }]}
        eyebrow="Catálogo"
        title="Todos los péptidos"
        image={headerImage}
      />
      <div className="mx-auto max-w-7xl px-6 py-10">
        {error && (
          <p className="text-sm text-red-400">
            No se pudo conectar a Supabase todavía — revisa tus variables de entorno en .env.local.
          </p>
        )}
        <CatalogGrid products={(products as Product[] | null) ?? []} />
      </div>
    </div>
  );
}
