'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatMxn } from '@/lib/format';
import type { Product, ProductVariant } from '@/lib/types';

// Barra de "agregar al carrito" fija abajo de la pantalla (estilo Exoma) —
// aparece en cuanto el botón principal de compra sale de la vista al hacer
// scroll, para no obligar al cliente a regresar arriba. A diferencia de
// Exoma, aquí también se puede cambiar la presentación sin salir de la
// barra — con pills compactas y scroll horizontal si no caben todas.
export default function StickyBuyBar({
  product,
  variants,
  selected,
  onSelectedChange,
  visible,
}: {
  product: Product;
  variants: ProductVariant[];
  selected: ProductVariant | null;
  onSelectedChange: (id: string) => void;
  visible: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const hasVariants = variants.length > 0;
  const price = selected ? selected.price_mxn : product.price_mxn;
  const stock = selected ? selected.stock : product.stock;
  const outOfStock = stock <= 0;

  function handleAdd() {
    if (outOfStock) return;
    addItem(product, selected ?? null, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur transition-transform duration-200 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-hidden={!visible}
    >
      <div className="mx-auto max-w-6xl px-4 py-2.5">
        {hasVariants && (
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
            {variants.map((v) => {
              const isSelected = v.id === selected?.id;
              const disabled = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectedChange(v.id)}
                  className={`shrink-0 rounded-theme border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    isSelected
                      ? 'border-ink bg-ink text-white'
                      : disabled
                      ? 'border-border text-muted line-through opacity-50'
                      : 'border-border text-ink hover:border-ink'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink">{product.name}</p>
            <p className="font-price text-sm text-ink">${formatMxn(price)} MXN</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-theme bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-40"
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {outOfStock ? 'Agotado' : added ? 'Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}
