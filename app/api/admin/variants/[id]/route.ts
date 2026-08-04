import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  const allowed = ['label', 'price_mxn', 'stock', 'image_url', 'sku'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('product_variants').update(update).eq('id', params.id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo guardar la presentación.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
