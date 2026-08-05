import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, short_description, category, purity, price_mxn, stock, on_sale, image_url } = body;

  if (!name || !category) {
    return NextResponse.json({ error: 'Nombre y categoría son obligatorios.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Genera un slug único a partir del nombre (nexa-labs-mots-c, y si ya
  // existe, nexa-labs-mots-c-2, etc.)
  const base = slugify(name) || 'producto';
  let slug = base;
  let attempt = 1;
  while (true) {
    const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      slug,
      name,
      short_description: short_description || '',
      category,
      purity: purity || '≥99% HPLC',
      price_mxn: Number(price_mxn) || 0,
      stock: Number(stock) || 0,
      on_sale: Boolean(on_sale),
      image_url: image_url || null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo crear el producto.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, product: data });
}
