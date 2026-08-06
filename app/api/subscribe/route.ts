import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Alfabeto sin caracteres ambiguos (sin 0/O, 1/I/L) para que el código se
// pueda dictar por teléfono o WhatsApp sin confusiones.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  const bytes = randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `NEXA10-${suffix}`;
}

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Correo inválido.' }, { status: 400 });
  }

  const normalized = email.toLowerCase().trim();
  const supabase = createServiceRoleClient();

  // onConflict: si el correo ya existe, no truena — simplemente no duplica.
  // (No revelamos si ya estaba suscrito, por privacidad.)
  const { error } = await supabase
    .from('subscribers')
    .upsert({ email: normalized }, { onConflict: 'email', ignoreDuplicates: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo guardar tu correo.' }, { status: 500 });
  }

  // Cada correo recibe UN código de bienvenida único, de un solo uso.
  // Si ya tiene uno sin usar, se le vuelve a mostrar el mismo (suscribirse
  // dos veces no genera códigos infinitos). Si ya lo usó, no hay otro.
  const { data: existing } = await supabase
    .from('discount_codes')
    .select('code, used')
    .eq('email', normalized)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      ok: true,
      discountCode: existing.used ? null : existing.code,
      alreadyUsed: existing.used,
      discountPercent: siteConfig.newsletter.discountPercent,
    });
  }

  // Genera un código nuevo — reintenta si por milagro choca con uno existente.
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode();
    const { error: insertError } = await supabase
      .from('discount_codes')
      .insert({ code, email: normalized, percent: siteConfig.newsletter.discountPercent });
    if (!insertError) {
      return NextResponse.json({
        ok: true,
        discountCode: code,
        discountPercent: siteConfig.newsletter.discountPercent,
      });
    }
  }

  console.error('No se pudo generar un código de descuento único.');
  return NextResponse.json({ error: 'No se pudo generar tu código. Intenta de nuevo.' }, { status: 500 });
}
