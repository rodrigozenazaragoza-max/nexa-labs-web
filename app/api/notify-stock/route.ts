import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    productId?: string;
    variantId?: string | null;
    productName?: string;
    name?: string;
    email?: string;
  };

  if (!body.email || !EMAIL_RE.test(body.email) || !body.productId || !body.productName) {
    return NextResponse.json({ error: 'Datos incompletos.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('stock_notifications').insert({
    product_id: body.productId,
    variant_id: body.variantId ?? null,
    product_name: body.productName,
    name: body.name?.trim() || null,
    email: body.email.toLowerCase().trim(),
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo guardar tu aviso.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
