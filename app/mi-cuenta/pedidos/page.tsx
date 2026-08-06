import Link from 'next/link';
import { Package, MapPin, Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { formatMxn } from '@/lib/format';
import { STATUS_LABELS } from '@/lib/order-status';

export const metadata = { title: `Mis pedidos | ${siteConfig.brand.name}` };
export const dynamic = 'force-dynamic';

export default async function MisPedidosPage() {
  const supabase = createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(
      'id, order_number, status, total_mxn, created_at, tracking_carrier, tracking_number, tracking_url, shipping_address, order_items(qty, variant_label, unit_price_mxn, products(name))'
    )
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-ink">
        Mis pedidos {orders && orders.length > 0 ? `(${orders.length})` : ''}
      </h1>

      {!orders || orders.length === 0 ? (
        <div className="rounded-theme border border-dashed border-border bg-white p-10 text-center">
          <Package size={28} className="mx-auto text-muted" />
          <p className="mt-3 text-sm text-muted">Todavía no tienes pedidos con este correo.</p>
          <Link href="/productos" className="mt-4 inline-block rounded-theme bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => {
            const status = STATUS_LABELS[o.status] ?? { label: o.status, className: 'bg-surface text-muted' };
            return (
              <div key={o.id} className="rounded-theme border border-border bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-semibold text-ink">{o.order_number}</p>
                    <p className="text-xs text-muted">
                      {new Date(o.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                </div>

                <div className="mt-3 divide-y divide-border border-t border-border">
                  {(o.order_items ?? []).map((it: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 text-xs">
                      <span className="text-ink">
                        {it.products?.name ?? 'Producto'} {it.variant_label ? `— ${it.variant_label}` : ''} × {it.qty}
                      </span>
                      <span className="font-semibold text-muted">${formatMxn(it.unit_price_mxn * it.qty)} MXN</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <MapPin size={12} /> {o.shipping_address}
                  </p>
                  <p className="font-price text-sm text-ink">Total: ${formatMxn(o.total_mxn)} MXN</p>
                </div>

                {o.tracking_number && (
                  <div className="mt-3 flex items-center gap-2 rounded-theme bg-primary-light px-3 py-2 text-xs text-primary-dark">
                    <Truck size={14} />
                    <span>
                      {o.tracking_carrier} — guía <strong>{o.tracking_number}</strong>
                      {o.tracking_url && (
                        <>
                          {' '}
                          ·{' '}
                          <a href={o.tracking_url} target="_blank" rel="noopener noreferrer" className="underline">
                            rastrear
                          </a>
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
