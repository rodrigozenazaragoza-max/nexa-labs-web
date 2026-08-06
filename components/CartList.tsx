'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2, Flame } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { itemUnitPrice, itemStock, itemImage } from '@/lib/cart-utils';
import { formatMxn } from '@/lib/format';
import { productLeadImage } from '@/lib/product-image';
import { siteConfig } from '@/lib/site-config';
import DiluentReminder from './DiluentReminder';
import type { Product } from '@/lib/types';

// Lista de items del carrito + recordatorio de diluyente + barra de envío
// gratis. La usan tanto el drawer lateral (components/CartDrawer.tsx) como
// la página completa /carrito, para no duplicar la lógica en dos lugares.
export default function CartList({
  diluentProduct,
  recommendedPool = [],
}: {
  diluentProduct: Product | null;
  recommendedPool?: Product[];
}) {
  const { items, setQty, removeItem, totalMxn, addItem } = useCart();
  const threshold = siteConfig.freeShippingThresholdMxn;
  const progress = Math.min(100, (totalMxn / threshold) * 100);
  const remaining = Math.max(0, threshold - totalMxn);

  // Sugerencias: productos que aún no están en el carrito, venta sugestiva
  // igual que en nexalabs.mx. Se agrega la primera presentación disponible.
  const suggestions = recommendedPool
    .filter((p) => !items.some((i) => i.product.id === p.id))
    .slice(0, 2);

  return (
    <div>
      <DiluentReminder diluentProduct={diluentProduct} />

      <div className="border-b border-border bg-primary-light p-4 text-xs">
        {remaining > 0 ? (
          <p>Te faltan <strong>${formatMxn(remaining)} MXN</strong> para envío gratis.</p>
        ) : (
          <p><strong>¡Felicidades!</strong> Tienes envío gratis.</p>
        )}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {items.length === 0 && <p className="text-sm text-muted">Tu carrito está vacío.</p>}
        {items.map((item) => {
          const stock = itemStock(item);
          const image = itemImage(item);
          return (
            <div key={item.key} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-primary-light">
                  {image ? (
                    <Image src={image} alt={item.product.name} fill className="object-cover" sizes="56px" />
                  ) : null}
                </div>
                <div>
                <p className="text-sm font-medium">{item.product.name}</p>
                {item.variant && <p className="text-xs text-muted">{item.variant.label}</p>}
                <p className="font-price text-xs text-muted">${formatMxn(itemUnitPrice(item))} MXN</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <button onClick={() => setQty(item.key, item.qty - 1)} className="rounded border border-border p-1">
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center text-xs">{item.qty}</span>
                  <button
                    onClick={() => setQty(item.key, item.qty + 1)}
                    disabled={item.qty >= stock}
                    className="rounded border border-border p-1 disabled:opacity-30"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                </div>
              </div>
              <button onClick={() => removeItem(item.key)} aria-label="Quitar">
                <Trash2 size={16} className="text-danger" />
              </button>
            </div>
          );
        })}
      </div>

      {items.length > 0 && suggestions.length > 0 && (
        <div className="border-t border-border p-5">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-ink">
            <Flame size={14} className="text-warn" /> Recomendados para tu investigación
          </p>
          <div className="flex flex-col gap-3">
            {suggestions.map((product) => {
              const variants = [...(product.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
              const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0] ?? null;
              const price = firstAvailable ? firstAvailable.price_mxn : product.price_mxn;
              const image = productLeadImage(product);
              return (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-primary-light">
                    {image ? (
                      <Image src={image} alt={product.name} fill className="object-cover" sizes="40px" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{product.name}</p>
                    <p className="font-price text-xs text-muted">${formatMxn(price)} MXN</p>
                  </div>
                  <button
                    onClick={() => addItem(product, firstAvailable, 1)}
                    className="rounded-theme border border-primary px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    + Agregar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
