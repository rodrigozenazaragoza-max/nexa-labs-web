import { productLeadImage } from './product-image';
import { siteConfig } from './site-config';
import { getAllProducts } from './data';

// Foto de fondo compartida para los headers de página (SectionHeader) —
// reutiliza uno de los productos destacados del hero para no tener que
// mantener una imagen decorativa aparte.
//
// Sale del catálogo ya memoizado (lib/data.ts): antes hacía su propia
// consulta a Supabase en CADA página que usa un SectionHeader, que son casi
// todas. Ya no recibe cliente — eso permitió quitar `createClient()` (y con
// él la lectura de cookies) de todas las páginas públicas, que era lo que
// las obligaba a renderizarse dinámicamente en cada visita.
export async function getSectionHeaderImage(): Promise<string | null> {
  const products = await getAllProducts();
  const withImage = siteConfig.hero.featuredProductSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .find((p) => p && productLeadImage(p));
  return withImage ? productLeadImage(withImage) : null;
}
