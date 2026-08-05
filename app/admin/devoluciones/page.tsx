import { createServiceRoleClient } from '@/lib/supabase/server';
import ReturnRow, { type ReturnRecord } from '@/components/admin/ReturnRow';
import { RotateCcw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DevolucionesPage() {
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from('returns')
    .select('id, order_number, customer_name, customer_email, reason, details, status, admin_notes, created_at, order:orders(total_mxn, customer_phone, status)')
    .order('created_at', { ascending: false });

  const returns = (data ?? []) as unknown as ReturnRecord[];

  const counts: Record<string, number> = { pendiente: 0, aprobada: 0, rechazada: 0, completada: 0 };
  for (const r of returns) counts[r.status] = (counts[r.status] ?? 0) + 1;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-h2 font-bold text-ink">Devoluciones</h1>
        <p className="mt-1 text-sm text-muted">
          Solicitudes enviadas por clientes desde la sección "Solicitar una devolución" del FAQ.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="rounded-theme border border-border bg-white p-4">
            <p className="text-xs capitalize text-muted">{status}</p>
            <p className="mt-1 font-price text-xl text-ink">{count}</p>
          </div>
        ))}
      </div>

      {returns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-theme border border-dashed border-border bg-white py-16 text-center text-sm text-muted">
          <RotateCcw size={28} className="mb-3 text-muted" />
          Todavía no hay solicitudes de devolución.
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <ReturnRow key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
