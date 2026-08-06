'use client';

import Image from 'next/image';
import { Plus, TrendingUp } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { productLeadImage } from '@/lib/product-image';
import { formatMxn } from '@/lib/format';
import type { Product } from '@/lib/types';

// "Frecuentemente comprados juntos" — venta cruzada estilo Exoma Peptides,
// debajo del botón de agregar al carrito en la página de producto.
export default function FrequentlyBoughtTogether({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  if (products.length === 0) return null;

  const rows = products.slice(0, 3).map((p) => {
    const variants = [...(p.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0] ?? null;
    const price = firstAvailable ? firstAvailable.price_mxn : p.price_mxn;
    return { product: p, variant: firstAvailable, price };
  });

  const total = rows.reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="mt-8 rounded-theme border border-border p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-heading text-sm font-bold text-ink">Frecuentemente comprados juntos</p>
        <span className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted">
          <TrendingUp size={12} /> Basado en ventas
        </span>
      </div>

      <div className="space-y-3">
        {rows.map(({ product, variant, price }) => {
          const image = productLeadImage(product);
          return (
            <div key={product.id} className="flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-primary-light">
                {image ? <Image src={image} alt={product.name} fill className="object-cover" sizes="44px" /> : null}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{product.name}</p>
                {variant && <p className="text-xs text-muted">{variant.label}</p>}
              </div>
              <span className="font-price text-sm text-ink">${formatMxn(price)}</span>
              <button
                onClick={() => addItem(product, variant, 1)}
                aria-label={`Agregar ${product.name}`}
                className="rounded-theme border border-border p-1.5 text-muted transition hover:border-primary hover:text-primary"
              >
                <Plus size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-muted">
          Total combinación: <span className="font-price text-ink">${formatMxn(total)} MXN</span>
        </p>
        <button
          onClick={() => rows.forEach(({ product, variant }) => addItem(product, variant, 1))}
          className="flex items-center gap-1.5 rounded-theme bg-primary px-4 py-2 text-xs font-semibold text-white"
        >
          <Plus size={13} /> Agregar los {rows.length} al carrito
        </button>
      </div>
    </div>
  );
}
