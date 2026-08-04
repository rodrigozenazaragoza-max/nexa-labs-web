'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { TriangleAlert } from 'lucide-react';
import SaleBadge from './SaleBadge';
import ProductPurchaseBox from './ProductPurchaseBox';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';
import ProductTrustRow from './ProductTrustRow';
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
}: {
  product: Product;
  related: Product[];
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

  return (
    <>
      <div>
        <div className="relative aspect-square overflow-hidden rounded-theme border border-border bg-primary-light">
          {product.on_sale && <SaleBadge />}
          {image ? (
            <Image src={image} alt={product.name} fill className="scale-[1.08] object-cover" sizes="480px" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-muted">[ Foto de producto ]</span>
          )}
        </div>

        {/* Aviso RUO — vive aquí, debajo de la foto, en vez de una
            etiqueta suelta encima del producto. */}
        <div className="mt-5 rounded-theme border border-border bg-surface p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-ink">
            <TriangleAlert size={14} className="text-danger" /> Exclusivo para investigación
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            <li>• Not for Human or Animal Use — solo uso en laboratorio.</li>
            <li>• Manéjalo únicamente personal calificado, con equipo de protección.</li>
            <li>• No es un medicamento, alimento ni cosmético.</li>
            <li>• Cada lote incluye Certificado de Análisis (COA) verificable.</li>
          </ul>
        </div>
      </div>

      <div>
        <span className="mb-2 inline-block rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
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
          />
        </div>

        {related && related.length > 0 && <FrequentlyBoughtTogether products={related} />}

        <ProductTrustRow />
      </div>
    </>
  );
}
