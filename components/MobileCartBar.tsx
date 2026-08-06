'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatMxn } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { amountToFreeShipping } from '@/lib/shipping';

// Barra fija de carrito para móvil (patrón de exomapeptides.mx): mientras
// hay algo en el carrito, el total y el acceso a pagar siempre están a la
// vista, sin importar en qué parte del catálogo ande el cliente.
//
// Se oculta en las páginas donde estorbaría o duplicaría controles:
// carrito, checkout, admin, y la ficha de producto (que ya tiene su propia
// barra de "Agregar al carrito").
const HIDDEN_ON = ['/carrito', '/checkout', '/admin'];

export default function MobileCartBar() {
  const { count, totalMxn, shippingMxn, finalTotalMxn } = useCart();
  const pathname = usePathname() ?? '';

  const isProductPage = /^\/productos\/[^/]+$/.test(pathname);
  const hidden = HIDDEN_ON.some((p) => pathname.startsWith(p)) || isProductPage;

  if (count === 0 || hidden) return null;

  const falta = amountToFreeShipping(totalMxn);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {falta > 0 ? (
        <p className="bg-primary-light px-4 py-1.5 text-center text-xs font-semibold text-primary-dark">
          Te faltan ${formatMxn(falta)} para envío gratis
        </p>
      ) : (
        <p className="bg-primary px-4 py-1.5 text-center text-xs font-semibold text-white">
          ✓ Envío gratis incluido
        </p>
      )}

      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="relative shrink-0 text-ink">
          <ShoppingBag size={22} />
          <span className="absolute -right-2 -top-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-white">
            {count}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-muted">Total</p>
          <p className="font-price text-base font-bold leading-tight text-ink">
            ${formatMxn(finalTotalMxn)} <span className="text-xs font-semibold">MXN</span>
            {shippingMxn > 0 && (
              <span className="ml-1 text-[11px] font-normal text-muted">(+ envío)</span>
            )}
          </p>
        </div>

        <Link
          href="/carrito"
          className="flex shrink-0 items-center gap-1.5 rounded-theme bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white"
        >
          Ver carrito <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
