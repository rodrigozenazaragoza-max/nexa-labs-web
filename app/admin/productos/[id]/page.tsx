import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createServiceRoleClient } from '@/lib/supabase/server';
import ProductEditForm from '@/components/admin/ProductEditForm';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminEditProductPage({ params }: { params: { id: string } }) {
  const supabase = createServiceRoleClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('id', params.id)
    .single();

  if (!product) return notFound();

  const { data: categoryRows } = await supabase.from('products').select('category');
  const categories = [...new Set((categoryRows ?? []).map((r) => r.category))].sort();

  return (
    <div>
      <Link href="/admin" className="mb-6 flex items-center gap-1 text-xs font-semibold text-primary">
        <ChevronLeft size={14} /> Volver a productos
      </Link>
      <ProductEditForm product={product as Product} categories={categories} />
    </div>
  );
}
