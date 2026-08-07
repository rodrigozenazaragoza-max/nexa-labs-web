// Se regenera cada 5 min y se sirve desde caché — el catálogo no cambia
// por visitante, así que no hay razón para renderizar de cero en cada clic.
export const revalidate = 300;

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getAllProducts, getSettings } from '@/lib/data';
import ProductGallery from '@/components/ProductGallery';
import ProductTabs from '@/components/ProductTabs';
import ProductCarousel from '@/components/ProductCarousel';
import type { Product } from '@/lib/types';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Antes esto eran 4 consultas seguidas: el producto, los ajustes, los
  // relacionados y el "te puede gustar" — y las dos últimas pedían
  // exactamente lo mismo a Supabase, solo con distinto límite. Ahora el
  // catálogo se lee una vez (memoizado en lib/data.ts) y los relacionados
  // se filtran en memoria.
  const [allProducts, settings] = await Promise.all([getAllProducts(), getSettings()]);

  const product = allProducts.find((p) => p.slug === params.slug);
  if (!product) return notFound();

  const sameCategory = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id
  );
  const related = sameCategory.slice(0, 3);
  const youMayLike = sameCategory.slice(0, 12);

  return (
    <div className="pb-20">
      {/* pb-20: espacio para que la barra fija de "agregar al carrito" no
          tape el final de la página cuando el cliente llega hasta abajo. */}
      {/* Aviso de uso — tarjeta redondeada estilo SwissChems: borde suave,
          fondo casi blanco, "Uso de producto:" en rojo y el resto en tinta. */}
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <div className="rounded-2xl border border-danger/25 bg-[#faf6f4] px-6 py-5 text-center">
          <p className="text-sm font-bold">
            <span className="text-danger">Uso de producto:</span>{' '}
            <span className="text-ink">este producto es exclusivamente para investigación.</span>
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Toda la información de este sitio es educativa. Prohibida cualquier introducción al cuerpo humano o
            animal. Solo debe ser manejado por profesionales calificados. No es un medicamento, alimento ni
            cosmético, y no debe ser mal etiquetado, mal usado o presentado como tal.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-medium text-ink">
          <Link href="/" className="hover:text-primary">Inicio</Link>
          <span className="text-muted">/</span>
          <Link href="/productos" className="hover:text-primary">Productos</Link>
          <span className="text-muted">/</span>
          <span>{product.category}</span>
          <span className="text-muted">/</span>
          <span className="font-semibold text-ink">{product.name}</span>
        </div>
        <Link href="/productos" className="flex items-center gap-1 font-semibold text-primary">
          <ChevronLeft size={14} /> Volver al catálogo
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-8 md:grid-cols-2">
        <ProductGallery
          product={product as Product}
          related={(related ?? []) as Product[]}
          whatsappNumber={settings.whatsappNumber}
        />
      </div>

      <ProductTabs product={product as Product} />

      {youMayLike && youMayLike.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-heading text-h3 font-bold text-ink">Te Puede Gustar</h2>
            <Link href="/productos" className="text-xs font-semibold text-primary">Ver todos los productos →</Link>
          </div>
          <ProductCarousel products={youMayLike as Product[]} />
        </section>
      )}
    </div>
  );
}
