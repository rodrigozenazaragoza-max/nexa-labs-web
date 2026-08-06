'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { productLeadImage } from '@/lib/product-image';
import { formatMxn } from '@/lib/format';
import PresentationSelect from './PresentationSelect';
import SaleBadge from './SaleBadge';
import type { Product } from '@/lib/types';

// Tarjeta de producto para el catálogo y "Más vendidos". Si el producto
// tiene presentaciones (5mg/10mg/...), se puede elegir cuál agregar sin
// salir de la tarjeta — igual que en nexalabs.mx.
export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const variants = [...(product.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const hasVariants = variants.length > 0;

  const firstAvailable = hasVariants ? variants.find((v) => v.stock > 0) ?? variants[0] : null;
  const [selectedId, setSelectedId] = useState<string | undefined>(firstAvailable?.id);
  const selected = hasVariants ? variants.find((v) => v.id === selectedId) ?? firstAvailable : null;

  const price = selected ? selected.price_mxn : product.price_mxn;
  const stock = selected ? selected.stock : product.stock;
  const outOfStock = hasVariants ? variants.every((v) => v.stock <= 0) : product.stock <= 0;
  const image = productLeadImage(product);

  const [added, setAdded] = useState(false);
  function handleAdd() {
    addItem(product, selected ?? null, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="group rounded-theme border border-border bg-white transition hover:shadow-md">
      <Link href={`/productos/${product.slug}`}>
        <div className="relative aspect-square w-full overflow-hidden rounded-t-theme bg-primary-light">
          {product.on_sale && <SaleBadge />}
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="scale-[1.03] object-cover transition-transform duration-300 group-hover:scale-[1.08]"
              sizes="360px"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-muted">[Foto]</span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/productos/${product.slug}`}>
          <span className="mb-2 inline-block rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-semibold text-accent">
            {product.category}
          </span>
          <h3 className="font-heading text-sm font-semibold text-ink">{product.name}</h3>
        </Link>

        {!outOfStock ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {stock} disponibles
          </p>
        ) : (
          <p className="mt-1 text-xs font-medium text-danger">Agotado</p>
        )}

        {hasVariants && (
          <PresentationSelect
            variants={variants}
            selectedId={selected?.id}
            onChange={setSelectedId}
          />
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-price text-sm leading-tight text-ink">
            ${formatMxn(price)} <span className="text-xs">MXN</span>
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label="Agregar al carrito"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-theme bg-primary text-white transition hover:bg-primary-dark disabled:opacity-40"
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
