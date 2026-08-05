'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingCart, CheckCircle2, Bell } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatMxn } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import PresentationPills from './PresentationPills';
import CoaBlock from './CoaBlock';
import NotifyMeModal from './NotifyMeModal';
import type { Product, ProductVariant } from '@/lib/types';

// Caja de compra de la página de producto — fusión Exoma (pills de dosis,
// bloque COA, stepper de cantidad, precio por mg) + aviso de stock estilo
// SwissChems. Si el producto no tiene variantes (ej. agua bacteriostática)
// simplemente usa el precio/stock base.
//
// La dosis seleccionada ahora vive en el componente padre (ProductGallery)
// para que la foto principal pueda cambiar junto con la presentación
// elegida — por eso selected/onSelectedChange llegan como props en vez
// de manejarse aquí adentro.
export default function ProductPurchaseBox({
  product,
  variants,
  selected,
  onSelectedChange,
}: {
  product: Product;
  variants: ProductVariant[];
  selected: ProductVariant | null;
  onSelectedChange: (id: string) => void;
}) {
  const hasVariants = variants.length > 0;

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [showNotify, setShowNotify] = useState(false);

  const price = selected ? selected.price_mxn : product.price_mxn;
  const stock = selected ? selected.stock : product.stock;
  const outOfStock = stock <= 0;

  // "$X MXN por mg" — si la etiqueta trae un número (ej. "50 mg"), como en Exoma.
  const perUnit = useMemo(() => {
    const label = selected?.label ?? '';
    const match = label.match(/(\d+(\.\d+)?)/);
    if (!match) return null;
    const n = parseFloat(match[1]);
    if (!n) return null;
    const unit = label.replace(/[\d.\s]/g, '') || 'mg';
    return `$${formatMxn(price / n)} MXN por ${unit}`;
  }, [selected, price]);

  function handleAdd() {
    addItem(product, selected ?? null, qty);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div>
      {hasVariants && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">Dosis</label>
            <span className={`text-xs ${outOfStock ? 'font-medium text-danger' : 'text-muted'}`}>
              {outOfStock ? 'Agotado' : `${stock} disponibles`}
            </span>
          </div>
          <PresentationPills variants={variants} selectedId={selected?.id} onChange={onSelectedChange} />
        </div>
      )}

      {product.coa_url && (
        <div className="mb-5">
          <CoaBlock coaUrl={product.coa_url} purity={product.purity} />
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Cantidad</span>
        <div className="flex items-center gap-1 rounded-theme border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2.5 text-muted hover:text-ink"
            aria-label="Menos"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
            disabled={qty >= stock}
            className="p-2.5 text-muted hover:text-ink disabled:opacity-30"
            aria-label="Más"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <p className="font-price text-2xl text-ink">${formatMxn(price)} MXN</p>
      </div>
      {perUnit && <p className="mt-0.5 text-xs text-muted">{perUnit}</p>}
      {!hasVariants && (
        <p className={`mt-1 text-xs ${outOfStock ? 'font-medium text-danger' : 'text-muted'}`}>
          {outOfStock ? 'Agotado' : `${stock} disponibles`}
        </p>
      )}

      {outOfStock ? (
        <button
          onClick={() => setShowNotify(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-theme border border-primary px-6 py-3 font-semibold text-primary sm:w-auto"
        >
          <Bell size={16} /> Notificarme cuando haya stock
        </button>
      ) : (
        <button
          onClick={handleAdd}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-theme bg-primary px-6 py-3 font-semibold text-white sm:w-auto"
        >
          <ShoppingCart size={16} />
          {added ? 'Agregado ✓' : 'Agregar al carrito'}
        </button>
      )}

      {!outOfStock && price * qty >= siteConfig.freeShippingThresholdMxn && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
          <CheckCircle2 size={14} /> ¡Listo! Tu pedido ya tiene envío gratis
        </p>
      )}

      {showNotify && (
        <NotifyMeModal
          productId={product.id}
          productName={product.name}
          variantId={selected?.id}
          variantLabel={selected?.label}
          onClose={() => setShowNotify(false)}
        />
      )}
    </div>
  );
}
