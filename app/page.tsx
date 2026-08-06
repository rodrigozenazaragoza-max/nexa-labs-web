import { createClient } from '@/lib/supabase/server';
import { getBestsellers } from '@/lib/bestsellers';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import CategoriesGrid from '@/components/CategoriesGrid';
import ProductCarousel from '@/components/ProductCarousel';
import CategoryTabsSection from '@/components/CategoryTabsSection';
import type { Product } from '@/lib/types';

export default async function HomePage() {
  const supabase = createClient();
  const products = await getBestsellers(supabase, 12);

  // Agrupa TODO el catálogo por categoría para la sección de tabs — usa
  // las categorías reales que ya tienes cargadas en Supabase, no una
  // lista fija.
  const { data: allProducts } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .order('name');
  const productsByCategory: Record<string, Product[]> = {};
  for (const p of (allProducts ?? []) as Product[]) {
    if (!productsByCategory[p.category]) productsByCategory[p.category] = [];
    productsByCategory[p.category].push(p);
  }

  return (
    <div>
      <Hero />
      <TrustBar />

      {products.length > 0 && (
        <section className="py-16">
          <div className="text-center">
            <h2 className="font-heading text-h2 font-bold text-ink">Más Vendidos</h2>
            <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-primary" />
          </div>
          <div className="mx-auto max-w-6xl px-6 pt-10">
            <ProductCarousel products={products} />
          </div>
        </section>
      )}

      <CategoryTabsSection productsByCategory={productsByCategory} />

      <CategoriesGrid />
    </div>
  );
}
