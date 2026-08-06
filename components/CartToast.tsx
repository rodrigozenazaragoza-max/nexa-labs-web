'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { itemImage } from '@/lib/cart-utils';
import { formatMxn } from '@/lib/format';

const VISIBLE_MS = 3500;

// Aviso flotante que confirma lo que se agregó al carrito, solo en móvil.
// Reemplaza al drawer que antes se abría de golpe y cortaba la compra:
// aquí el cliente ve la foto del producto, confirma que sí entró, y decide
// si sigue viendo o va al carrito.
export default function CartToast() {
  const { lastAdded, dismissLastAdded } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAdded) return;
    setVisible(true);
    const hide = setTimeout(() => setVisible(false), VISIBLE_MS);
    // Se limpia del estado después de la transición de salida.
    const clear = setTimeout(() => dismissLastAdded(), VISIBLE_MS + 350);
    return () => {
      clearTimeout(hide);
      clearTimeout(clear);
    };
    // `at` cambia aunque sea el mismo producto — así se reinicia la animación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAdded?.at]);

  if (!lastAdded) return null;

  const { product, variant, qty } = lastAdded;
  const image = itemImage({ key: '', product, variant, qty });
  const price = variant ? variant.price_mxn : product.price_mxn;

  return (
    <div
      className={`fixed inset-x-3 z-[60] transition-all duration-300 md:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      // Se coloca arriba de la barra fija del carrito para no taparla.
      style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-theme border border-border bg-white p-3 shadow-[0_8px_28px_rgba(0,0,0,0.16)]">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-primary-light">
          {image ? (
            <Image src={image} alt="" fill className="object-cover" sizes="48px" />
          ) : null}
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
            <Check size={12} strokeWidth={3} />
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
          <p className="text-xs text-muted">
            {variant ? `${variant.label} · ` : ''}
            {qty > 1 ? `${qty} × ` : ''}${formatMxn(price)} MXN
          </p>
        </div>

        <Link
          href="/carrito"
          className="shrink-0 rounded-theme bg-primary px-3.5 py-2 text-xs font-bold text-white"
        >
          Ver carrito
        </Link>
      </div>
    </div>
  );
}
