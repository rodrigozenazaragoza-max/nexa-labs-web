import NewProductForm from '@/components/admin/NewProductForm';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const supabase = createServiceRoleClient();
  const { data: categoryRows } = await supabase.from('products').select('category');
  const categories = [...new Set((categoryRows ?? []).map((r) => r.category))].sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-h2 font-bold text-ink">Nuevo producto</h1>
        <p className="mt-1 text-sm text-muted">Llena los datos básicos — podrás agregar presentaciones y ajustar todo después.</p>
      </div>
      <NewProductForm categories={categories} />
    </div>
  );
}
