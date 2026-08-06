'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import SaleBadge from './SaleBadge';
import ProductPurchaseBox from './ProductPurchaseBox';
import StickyBuyBar from './StickyBuyBar';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';
import ProductTrustRow, { ProductQuickLinks, ProductTrustBadges } from './ProductTrustRow';
import { productLeadImage } from '@/lib/product-image';
import type { Product } from '@/lib/types';

// Une la foto principal y la caja de compra bajo un solo estado
// (selectedId) para que, al cambiar de presentación/dosis, la foto
// mostrada cambie junto con ella. Antes la foto vivía en la página
// (Server Component, se calculaba una sola vez) y la dosis seleccionada
// vivía adentro de ProductPurchaseBox — nunca se enteraban una de la otra.
//
// Devuelve un Fragment con dos <div> (columna de foto y columna de info)
// para poder seguir usándose directo dentro del grid de dos columnas de
// la página de producto.
export default function ProductGallery({
  product,
  related,
  whatsappNumber,
}: {
  product: Product;
  related: Product[];
  whatsappNumber?: string;
}) {
  const variants = useMemo(
    () => [...(product.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [product.variants]
  );
  const hasVariants = variants.length > 0;
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];

  const [selectedId, setSelectedId] = useState<string | undefined>(firstAvailable?.id);
  const selected = hasVariants ? variants.find((v) => v.id === selectedId) ?? firstAvailable ?? null : null;

  // Si la presentación elegida tiene su propia foto, úsala. Si no, cae al
  // mejor fallback disponible (la de la primera presentación con foto, o
  // la del producto base).
  const image = selected?.image_url || productLeadImage(product);

  // Muestra la barra fija de "agregar al carrito" en cuanto el botón
  // principal de la caja de compra sale de la vista al hacer scroll hacia
  // abajo — y la oculta de nuevo si el cliente regresa arriba. Usamos un
  // sentinel invisible justo debajo de la caja de compra en vez de
  // observar el botón directamente, para no tener que meter un ref dentro
  // de ProductPurchaseBox.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Columna izquierda pegajosa: la foto y los accesos rápidos siguen al
          cliente mientras hace scroll por la columna de info (que es mucho
          más larga). Así se elimina el hueco blanco en vez de solo taparlo,
          y la foto del producto nunca se pierde de vista. */}
      <div className="self-start md:sticky md:top-24">
        <div className="relative aspect-square overflow-hidden rounded-theme border border-border bg-primary-light">
          {product.on_sale && <SaleBadge />}
          {image ? (
            <Image src={image} alt={product.name} fill className="scale-[1.08] object-cover" sizes="480px" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-muted">[ Foto de producto ]</span>
          )}
        </div>

        <div className="mt-5">
          <ProductQuickLinks />
        </div>

        <div className="mt-4">
          <ProductTrustBadges />
        </div>
      </div>

      <div>
        <span className="mb-2 inline-block rounded-full bg-accent-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
          {product.category}
        </span>
        <h1 className="font-heading text-h2 font-bold text-ink">{product.name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{product.short_description}</p>
        <div className="mt-4 flex gap-4 border-b border-dashed border-border pb-4 text-sm">
          <span className="text-muted">Pureza (HPLC)</span>
          <span className="font-medium">{product.purity}</span>
        </div>

        <div className="mt-5">
          <ProductPurchaseBox
            product={product}
            variants={variants}
            selected={selected}
            onSelectedChange={setSelectedId}
            whatsappNumber={whatsappNumber}
          />
          <div ref={sentinelRef} />
        </div>

        {related && related.length > 0 && <FrequentlyBoughtTogether products={related} />}

        <ProductTrustRow />
      </div>

      <StickyBuyBar
        product={product}
        variants={variants}
        selected={selected}
        onSelectedChange={setSelectedId}
        visible={showSticky}
      />
    </>
  );
}
