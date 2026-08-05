import type { SupabaseClient } from '@supabase/supabase-js';

export type SiteSettings = {
  whatsappNumber: string;
  whatsappMessage: string;
};

// Lee la fila única de configuración (tabla `settings`, id=1) — el número
// de WhatsApp que se usa en TODOS los botones "Contáctanos por WhatsApp"
// del sitio vive aquí, editable desde /admin/configuracion, en vez de estar
// quemado en el código.
export async function getSiteSettings(supabase: SupabaseClient): Promise<SiteSettings> {
  const { data } = await supabase.from('settings').select('whatsapp_number, whatsapp_message').eq('id', 1).maybeSingle();

  return {
    whatsappNumber: data?.whatsapp_number || '526221193067',
    whatsappMessage: data?.whatsapp_message || 'Hola, tengo una pregunta sobre sus productos.',
  };
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
