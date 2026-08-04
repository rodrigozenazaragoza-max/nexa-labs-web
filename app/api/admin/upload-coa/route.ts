import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Sube el PDF del Certificado de Análisis (COA) de un producto a Supabase
// Storage (bucket "coas") y guarda la URL pública en products.coa_url.
// Cada vez que se sube un archivo nuevo se reemplaza el anterior (mismo
// nombre de archivo por producto), así que "reemplazar COA" es simplemente
// subir un PDF nuevo desde el panel admin.
const BUCKET = 'coas';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const productId = form.get('productId') as string | null;

  if (!file || !productId) {
    return NextResponse.json({ error: 'Falta el archivo o el id del producto.' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'El certificado debe ser un archivo PDF.' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'El PDF no puede pesar más de 10 MB.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Nombre fijo por producto (sin timestamp) para que al re-subir un COA
  // actualizado se sobreescriba el archivo y el link nunca cambie.
  const path = `${productId}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (uploadError) {
    console.error(uploadError);
    return NextResponse.json(
      { error: `No se pudo subir el PDF. Revisa que el bucket "${BUCKET}" exista en Supabase Storage. (${uploadError.message})` },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Le agregamos un parámetro con la fecha para que el navegador no muestre
  // una versión vieja en caché cuando se reemplaza el PDF.
  const coaUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase.from('products').update({ coa_url: coaUrl }).eq('id', productId);

  if (updateError) {
    console.error(updateError);
    return NextResponse.json({ error: 'El PDF se subió pero no se pudo guardar en el producto.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, coaUrl });
}
