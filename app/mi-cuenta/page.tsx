import Link from 'next/link';
import { Package, ShoppingBag, Wallet, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { formatMxn } from '@/lib/format';
import { STATUS_LABELS } from '@/lib/order-status';
import { getBestsellers } from '@/lib/bestsellers';
import ProductCarousel from '@/components/ProductCarousel';

export const metadata = { title: `Mi Cuenta | ${siteConfig.brand.name}` };
export const dynamic = 'force-dynamic';

export default async function MiCuentaResumenPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_mxn, created_at, order_items(qty)')
    .order('created_at', { ascending: false });

  const recommended = await getBestsellers(supabase, 8);

  const validOrders = (orders ?? []).filter((o: any) => o.status !== 'cancelled');
  const totalSpent = validOrders.reduce((sum: number, o: any) => sum + (o.total_mxn ?? 0), 0);
  const totalItems = validOrders.reduce(
    (sum: number, o: any) => sum + (o.order_items ?? []).reduce((s: number, it: any) => s + it.qty, 0),
    0
  );

  const recentOrders = (orders ?? []).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-theme border border-border bg-white p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
            <Package size={16} />
          </span>
          <p className="mt-3 font-heading text-2xl font-bold text-ink">{orders?.length ?? 0}</p>
          <p className="text-xs text-muted">Pedidos totales</p>
        </div>
        <div className="rounded-theme border border-border bg-white p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
            <Wallet size={16} />
          </span>
          <p className="mt-3 font-heading text-2xl font-bold text-ink">${formatMxn(totalSpent)}</p>
          <p className="text-xs text-muted">Total gastado (MXN)</p>
        </div>
        <div className="rounded-theme border border-border bg-white p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
            <ShoppingBag size={16} />
          </span>
          <p className="mt-3 font-heading text-2xl font-bold text-ink">{totalItems}</p>
          <p className="text-xs text-muted">Artículos comprados</p>
        </div>
      </div>

      <div className="rounded-theme border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink">Pedidos recientes</h2>
          {orders && orders.length > 0 && (
            <Link href="/mi-cuenta/pedidos" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              Ver todos <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-theme border border-dashed border-border p-8 text-center">
            <Package size={26} className="mx-auto text-muted" />
            <p className="mt-3 text-sm text-muted">Todavía no tienes pedidos con este correo.</p>
            <Link href="/productos" className="mt-4 inline-block rounded-theme bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((o: any) => {
              const status = STATUS_LABELS[o.status] ?? { label: o.status, className: 'bg-surface text-muted' };
              return (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-theme border border-border px-4 py-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-ink">{o.order_number}</p>
                    <p className="text-xs text-muted">
                      {new Date(o.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                  <p className="font-price text-sm text-ink">${formatMxn(o.total_mxn)} MXN</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {recommended.length > 0 && (
        <div className="rounded-theme border border-border bg-white p-6">
          <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-ink">También te puede interesar</h2>
          <ProductCarousel products={recommended} />
        </div>
      )}
    </div>
  );
}
