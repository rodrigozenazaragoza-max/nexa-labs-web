import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

const VALID_STATUSES = ['pendiente', 'aprobada', 'rechazada', 'completada'];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const update: Record<string, unknown> = {};

  if ('status' in body) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Estatus no válido.' }, { status: 400 });
    }
    update.status = body.status;
  }
  if ('admin_notes' in body) {
    update.admin_notes = body.admin_notes;
  }
  update.updated_at = new Date().toISOString();

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: 'Nada que actualizar.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('returns').update(update).eq('id', params.id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo guardar la devolución.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
