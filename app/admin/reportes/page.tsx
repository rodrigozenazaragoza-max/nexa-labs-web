import { createServiceRoleClient } from '@/lib/supabase/server';
import { formatMxn } from '@/lib/format';
import ExportCsvButton from '@/components/admin/ExportCsvButton';
import { ClipboardList } from 'lucide-react';

export const dynamic = 'force-dynamic';

type OrderItemRow = {
  qty: number;
  unit_price_mxn: number;
  variant_label: string | null;
  product: { id: string; name: string; category: string } | null;
  order: { status: string; created_at: string } | null;
};

type ReportRow = {
  key: string;
  productName: string;
  category: string;
  variantLabel: string;
  unitsSold: number;
  revenue: number;
};

export default async function ReportsPage() {
  const supabase = createServiceRoleClient();

  // order_items ya trae variant_label (texto guardado al momento de la
  // compra), así que no necesitamos join con product_variants para el
  // reporte — mucho más simple.
  const { data: itemsRaw } = await supabase
    .from('order_items')
    .select('qty, unit_price_mxn, variant_label, product:products(id, name, category), order:orders(status, created_at)')
    .order('created_at', { referencedTable: 'orders', ascending: false });

  const items = (itemsRaw ?? []) as unknown as OrderItemRow[];

  // "Vendido" = todo lo que no esté cancelado (pending + paid + shipped).
  // Las órdenes canceladas no cuentan para el inventario teórico.
  const counted = items.filter((i) => i.order?.status !== 'cancelled');

  const byStatus: Record<string, number> = {};
  for (const i of items) {
    const s = i.order?.status ?? 'desconocido';
    byStatus[s] = (byStatus[s] ?? 0) + 1;
  }

  const grouped = new Map<string, ReportRow>();
  for (const i of counted) {
    if (!i.product) continue;
    const key = `${i.product.id}::${i.variant_label ?? ''}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.unitsSold += i.qty;
      existing.revenue += i.qty * i.unit_price_mxn;
    } else {
      grouped.set(key, {
        key,
        productName: i.product.name,
        category: i.product.category,
        variantLabel: i.variant_label ?? '—',
        unitsSold: i.qty,
        revenue: i.qty * i.unit_price_mxn,
      });
    }
  }

  const rows = [...grouped.values()].sort((a, b) => b.unitsSold - a.unitsSold);
  const totalUnits = rows.reduce((sum, r) => sum + r.unitsSold, 0);
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);

  // Stock actual (teórico, según el sistema) por producto+presentación —
  // para comparar renglón a renglón contra el conteo físico.
  const { data: products } = await supabase
    .from('products')
    .select('id, name, stock, variants:product_variants(label, stock)');

  const stockByProduct = new Map<string, { total: number; byLabel: Map<string, number> }>();
  for (const p of products ?? []) {
    const variants = (p as any).variants as { label: string; stock: number }[] | undefined;
    if (variants && variants.length > 0) {
      const byLabel = new Map<string, number>();
      for (const v of variants) byLabel.set(v.label, v.stock);
      stockByProduct.set(p.name, { total: variants.reduce((s, v) => s + v.stock, 0), byLabel });
    } else {
      stockByProduct.set(p.name, { total: (p as any).stock, byLabel: new Map() });
    }
  }

  const csvRows = rows.map((r) => {
    const stockInfo = stockByProduct.get(r.productName);
    const theoreticalStock = stockInfo?.byLabel.get(r.variantLabel) ?? stockInfo?.total ?? '';
    return {
      Producto: r.productName,
      Presentación: r.variantLabel,
      Categoría: r.category,
      'Unidades vendidas': r.unitsSold,
      'Ingresos (MXN)': r.revenue.toFixed(2),
      'Stock teórico actual': theoreticalStock,
      'Conteo físico': '',
      Diferencia: '',
    };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 font-bold text-ink">Reportes de ventas</h1>
          <p className="mt-1 text-sm text-muted">
            Unidades vendidas por producto/presentación, para comparar tu inventario teórico (sistema) contra tu conteo físico.
          </p>
        </div>
        <ExportCsvButton rows={csvRows} filename="reporte-ventas-nexa-labs.csv" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-theme border border-border bg-white p-4">
          <p className="text-xs text-muted">Unidades vendidas</p>
          <p className="mt-1 font-price text-xl text-ink">{totalUnits}</p>
        </div>
        <div className="rounded-theme border border-border bg-white p-4">
          <p className="text-xs text-muted">Ingresos totales</p>
          <p className="mt-1 font-price text-xl text-ink">${formatMxn(totalRevenue)}</p>
        </div>
        {['pending', 'paid', 'shipped', 'cancelled'].map((status) => (
          <div key={status} className="rounded-theme border border-border bg-white p-4">
            <p className="text-xs capitalize text-muted">Órdenes {status === 'pending' ? 'pendientes' : status === 'paid' ? 'pagadas' : status === 'shipped' ? 'enviadas' : 'canceladas'}</p>
            <p className="mt-1 font-price text-xl text-ink">{byStatus[status] ?? 0}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-theme border border-dashed border-border bg-white py-16 text-center text-sm text-muted">
          <ClipboardList size={28} className="mb-3 text-muted" />
          Todavía no hay ventas registradas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-theme border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Presentación</th>
                <th className="px-4 py-3 text-right">Vendido</th>
                <th className="px-4 py-3 text-right">Ingresos</th>
                <th className="px-4 py-3 text-right">Stock teórico</th>
                <th className="px-4 py-3 text-right">Conteo físico</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const stockInfo = stockByProduct.get(r.productName);
                const theoreticalStock = stockInfo?.byLabel.get(r.variantLabel) ?? stockInfo?.total ?? '—';
                return (
                  <tr key={r.key} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-medium text-ink">{r.productName}</td>
                    <td className="px-4 py-3 text-muted">{r.variantLabel}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">{r.unitsSold}</td>
                    <td className="px-4 py-3 text-right font-price text-ink">${formatMxn(r.revenue)}</td>
                    <td className="px-4 py-3 text-right text-muted">{theoreticalStock}</td>
                    <td className="px-4 py-3 text-right text-muted">______</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-muted">
        "Stock teórico" es lo que el sistema dice que debería haber. Cuenta físicamente tu inventario y anota el resultado en "Conteo físico" para encontrar diferencias (mermas, errores de captura, etc). Las órdenes canceladas no se cuentan como vendidas.
      </p>
    </div>
  );
}
