import { createClient } from './supabase/server';
import { productLeadImage } from './product-image';
import { siteConfig } from './site-config';
import type { Product } from './types';

// Foto de fondo compartida para los headers de página (SectionHeader) —
// reutiliza uno de los productos destacados del hero para no tener que
// mantener una imagen decorativa aparte.
export async function getSectionHeaderImage(
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .in('slug', siteConfig.hero.featuredProductSlugs);
  const withImage = (data as Product[] | null)?.find((p) => productLeadImage(p));
  return withImage ? productLeadImage(withImage) : null;
}
