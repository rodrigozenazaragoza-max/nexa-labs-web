import Link from 'next/link';
import { ChevronLeft, TriangleAlert } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductGallery from '@/components/ProductGallery';
import ProductTabs from '@/components/ProductTabs';
import ProductCarousel from '@/components/ProductCarousel';
import type { Product } from '@/lib/types';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('slug', params.slug)
    .single();

  if (!product) return notFound();

  const { data: related } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(3);

  const { data: youMayLike } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(12);

  return (
    <div className="pb-20">
      {/* pb-20: espacio para que la barra fija de "agregar al carrito" no
          tape el final de la página cuando el cliente llega hasta abajo. */}
      {/* Aviso de uso — estilo SwissChems, arriba de todo */}
      <div className="border-b border-danger/20 bg-danger-bg px-6 py-3 text-center">
        <p className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold text-danger">
          <TriangleAlert size={14} /> Uso de producto: este producto es exclusivamente para investigación.
        </p>
        <p className="mt-0.5 text-[11px] text-danger/80">
          Toda la información de este sitio es educativa. Prohibida cualquier introducción al cuerpo humano o animal.
          Solo debe ser manejado por profesionales calificados. No es un medicamento, alimento ni cosmético.
        </p>
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
        <ProductGallery product={product as Product} related={(related ?? []) as Product[]} />
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
