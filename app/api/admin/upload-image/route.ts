import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Sube una foto a Supabase Storage y actualiza image_url del producto o
// presentación correspondiente. El bucket se configura con la variable de
// entorno SUPABASE_STORAGE_BUCKET (debe existir y ser público en Supabase
// Storage) — usa el mismo bucket donde ya viven las fotos actuales del
// catálogo si quieres que todo quede junto.
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const targetType = form.get('targetType') as string | null; // 'product' | 'variant'
  const targetId = form.get('targetId') as string | null;

  if (!file || !targetType || !targetId) {
    return NextResponse.json({ error: 'Faltan datos (archivo, tipo o id).' }, { status: 400 });
  }
  if (!['product', 'variant'].includes(targetType)) {
    return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'El archivo debe ser una imagen.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${targetType}s/${targetId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error(uploadError);
    return NextResponse.json(
      { error: `No se pudo subir la imagen. Revisa que el bucket "${BUCKET}" exista y sea público en Supabase Storage. (${uploadError.message})` },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const imageUrl = publicUrlData.publicUrl;

  const table = targetType === 'product' ? 'products' : 'product_variants';
  const { error: updateError } = await supabase.from(table).update({ image_url: imageUrl }).eq('id', targetId);

  if (updateError) {
    console.error(updateError);
    return NextResponse.json({ error: 'La imagen se subió pero no se pudo guardar en el producto.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, imageUrl });
}
