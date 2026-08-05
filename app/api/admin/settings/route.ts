import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Protegido automáticamente por el middleware (todo /api/admin/* requiere
// la sesión de admin), igual que el resto del panel.
export async function PATCH(req: Request) {
  const body = (await req.json()) as { whatsappNumber?: string; whatsappMessage?: string };

  if (!body.whatsappNumber?.trim()) {
    return NextResponse.json({ error: 'El número de WhatsApp no puede estar vacío.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('settings')
    .update({
      whatsapp_number: body.whatsappNumber.replace(/\D/g, ''),
      whatsapp_message: body.whatsappMessage?.trim() || 'Hola, tengo una pregunta sobre sus productos.',
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo guardar la configuración.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
