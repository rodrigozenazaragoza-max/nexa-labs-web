'use client';

import Link from 'next/link';
import { X, Tag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import CartList from './CartList';
import { formatMxn } from '@/lib/format';
import type { Product } from '@/lib/types';

export default function CartDrawer({
  diluentProduct,
  recommendedPool = [],
}: {
  diluentProduct: Product | null;
  recommendedPool?: Product[];
}) {
  const {
    items, totalMxn, discountMxn, finalTotalMxn, isOpen, closeCart,
    couponInput, setCouponInput, appliedCoupon, couponMsg, applyCoupon,
  } = useCart();

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-[90] bg-black/40" onClick={closeCart} />}
      <aside
        className={`fixed right-0 top-0 z-[95] flex h-full w-full max-w-sm transform flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border p-5">
          <h2 className="font-heading text-lg font-bold">Carrito ({items.length})</h2>
          <button onClick={closeCart} aria-label="Cerrar carrito"><X size={20} /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <CartList diluentProduct={diluentProduct} recommendedPool={recommendedPool} />
        </div>

        {items.length > 0 && (
          <div className="shrink-0 border-t border-border bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Tag size={14} className="shrink-0 text-muted" />
              <input
                placeholder="Código de descuento"
                className="w-full rounded-theme border border-border px-3 py-2 text-xs"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="whitespace-nowrap rounded-theme border border-border px-3 py-2 text-xs font-semibold"
              >
                Aplicar
              </button>
            </div>
            {couponMsg && (
              <p className={`mb-3 text-xs ${appliedCoupon ? 'text-primary' : 'text-danger'}`}>{couponMsg}</p>
            )}

            <div className="mb-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-price">${formatMxn(totalMxn)} MXN</span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-primary">
                  <span>Descuento</span>
                  <span className="font-price">-${formatMxn(discountMxn)} MXN</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-semibold text-ink">
                <span>Total</span>
                <span className="font-price">${formatMxn(finalTotalMxn)} MXN</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block rounded-theme bg-primary py-3 text-center text-sm font-semibold text-white"
            >
              Ir a checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
