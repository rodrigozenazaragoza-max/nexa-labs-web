'use client';

import { useState } from 'react';
import { Droplet, AlertTriangle } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatMxn } from '@/lib/format';
import type { Product } from '@/lib/types';

// Recordatorio de agua bacteriostática: si hay péptidos en el carrito y el
// diluyente NO está incluido, lo sugerimos con un botón de agregado rápido.
// Es un recordatorio, no una venta forzada — el botón "Ya tengo" lo oculta
// por el resto de la sesión.
export default function DiluentReminder({ diluentProduct }: { diluentProduct: Product | null }) {
  const { items, addItem } = useCart();
  const [dismissed, setDismissed] = useState(false);

  if (!diluentProduct || dismissed) return null;

  // Se agrega específicamente la presentación de 3 ml del catálogo (no el
  // precio base del producto) — así el renglón que aparece en el carrito
  // queda igual de claro que si el cliente la hubiera elegido a mano en su
  // ficha de producto.
  const variant3ml = diluentProduct.variants?.find((v) => v.label.replace(/\s+/g, '').toLowerCase() === '3ml') ?? null;
  const price = variant3ml ? variant3ml.price_mxn : diluentProduct.price_mxn;

  const hasDiluent = items.some(
    (i) => i.product.id === diluentProduct.id && (!variant3ml || i.variant?.id === variant3ml.id)
  );
  const peptideCount = items.filter((i) => i.product.id !== diluentProduct.id).length;

  if (hasDiluent || peptideCount === 0) return null;

  return (
    <div className="flex items-start gap-3 border-b border-warn/30 bg-warn-bg p-4 text-xs">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn" />
      <div className="flex-1">
        <p className="font-semibold text-ink">Recordatorio: Agua Bacteriostática (3 ml)</p>
        <p className="mt-0.5 text-muted">
          {peptideCount} {peptideCount === 1 ? 'péptido se reconstituye' : 'péptidos se reconstituyen'} con agua.
          Agregarla es opcional.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => addItem(diluentProduct, variant3ml, 1)}
            className="flex items-center gap-1.5 rounded-theme bg-primary px-3 py-1.5 font-semibold text-white"
          >
            <Droplet size={13} /> <span className="font-price">${formatMxn(price)} MXN</span>
          </button>
          <button onClick={() => setDismissed(true)} className="text-muted underline">
            Ya tengo
          </button>
        </div>
      </div>
    </div>
  );
}
