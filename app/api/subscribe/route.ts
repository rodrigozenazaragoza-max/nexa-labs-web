import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Correo inválido.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // onConflict: si el correo ya existe, no truena — simplemente no duplica.
  // (No revelamos si ya estaba suscrito, por privacidad.)
  const { error } = await supabase
    .from('subscribers')
    .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email', ignoreDuplicates: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo guardar tu correo.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    discountCode: siteConfig.newsletter.discountCode,
    discountPercent: siteConfig.newsletter.discountPercent,
  });
}
