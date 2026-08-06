import { createClient } from '@/lib/supabase/server';
import CatalogGrid from '@/components/CatalogGrid';
import SectionHeader from '@/components/SectionHeader';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { getAllProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

export default async function CatalogPage() {
  const supabase = createClient();
  // El catálogo sale de la consulta memoizada (la misma que ya usó el
  // layout en esta petición) y se ordena por nombre en memoria.
  const [allProducts, headerImage] = await Promise.all([
    getAllProducts(),
    getSectionHeaderImage(supabase),
  ]);
  const products = [...allProducts].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <SectionHeader
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Productos' }]}
        eyebrow="Catálogo"
        title="Todos los péptidos"
        image={headerImage}
      />
      <div className="mx-auto max-w-7xl px-6 py-10">
        {products.length === 0 && (
          <p className="text-sm text-muted">
            No hay productos publicados todavía. Si acabas de configurar la tienda, revisa la
            conexión a Supabase en tus variables de entorno.
          </p>
        )}
        <CatalogGrid products={products as Product[]} />
      </div>
    </div>
  );
}
