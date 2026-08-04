'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { siteConfig } from '@/lib/site-config';
import { formatMxn } from '@/lib/format';
import SectionHeader from '@/components/SectionHeader';

export default function CheckoutPage() {
  const {
    items, totalMxn, discountMxn, finalTotalMxn, clear,
    couponInput, setCouponInput, appliedCoupon, couponMsg, applyCoupon,
  } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    confirmsResearchUse: false, confirmsAge: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!form.confirmsResearchUse || !form.confirmsAge) {
      setErrorMsg('Debes confirmar el uso de investigación y la mayoría de edad para continuar.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer: form, couponCode: appliedCoupon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar el pedido.');
      clear();
      router.push(data.payment.redirectUrl || `/checkout/success?order=${data.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <p className="mx-auto max-w-lg px-6 py-14 text-muted">Tu carrito está vacío.</p>;
  }

  return (
    <div>
      <SectionHeader crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Checkout' }]} title="Checkout" />
      <div className="mx-auto max-w-lg px-6 py-14">
      <form onSubmit={submit} className="space-y-4">
        <input required placeholder="Nombre completo" className="w-full rounded-theme border border-border px-4 py-3"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" placeholder="Correo electrónico" className="w-full rounded-theme border border-border px-4 py-3"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required placeholder="Teléfono" className="w-full rounded-theme border border-border px-4 py-3"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <textarea required placeholder="Dirección de envío" className="w-full rounded-theme border border-border px-4 py-3"
          value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

        <div className="flex gap-2">
          <input
            placeholder="Código de descuento"
            className="w-full rounded-theme border border-border px-4 py-3 text-sm"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
          />
          <button type="button" onClick={applyCoupon} className="whitespace-nowrap rounded-theme border border-border px-4 text-sm font-semibold">
            Aplicar
          </button>
        </div>
        {couponMsg && (
          <p className={`text-xs ${appliedCoupon ? 'text-primary' : 'text-danger'}`}>{couponMsg}</p>
        )}

        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" className="mt-1" checked={form.confirmsResearchUse}
            onChange={(e) => setForm({ ...form, confirmsResearchUse: e.target.checked })} />
          Confirmo que estos productos son exclusivamente para investigación científica, no para consumo humano o animal.
        </label>
        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" className="mt-1" checked={form.confirmsAge}
            onChange={(e) => setForm({ ...form, confirmsAge: e.target.checked })} />
          Confirmo que soy mayor de edad.
        </label>

        {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}

        <div className="space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between text-muted">
            <span>Subtotal</span>
            <span className="font-price">${formatMxn(totalMxn)} MXN</span>
          </div>
          {appliedCoupon && (
            <div className="flex items-center justify-between text-primary">
              <span>Descuento ({siteConfig.newsletter.discountPercent}%)</span>
              <span className="font-price">-${formatMxn(discountMxn)} MXN</span>
            </div>
          )}
          <div className="flex items-center justify-between text-lg font-semibold text-ink">
            <span>Total</span>
            <span className="font-price">${formatMxn(finalTotalMxn)} MXN</span>
          </div>
        </div>

        <button disabled={loading} className="w-full rounded-theme bg-primary py-3 font-semibold text-white disabled:opacity-50">
          {loading ? 'Procesando...' : 'Confirmar pedido'}
        </button>
      </form>
      </div>
    </div>
  );
}
