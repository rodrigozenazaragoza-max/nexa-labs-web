import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { product_id, label, price_mxn, stock, sort_order } = body;

  if (!product_id) {
    return NextResponse.json({ error: 'Falta el producto.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      product_id,
      label: label || 'Nueva presentación',
      price_mxn: Number(price_mxn) || 0,
      stock: Number(stock) || 0,
      sort_order: sort_order ?? 999,
    })
    .select()
    .single();

  if (error || !data) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo crear la presentación.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, variant: data });
}
