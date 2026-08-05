import { createClient } from '@/lib/supabase/server';
import { getSiteSettings } from '@/lib/get-settings';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminConfiguracionPage() {
  const supabase = createClient();
  const settings = await getSiteSettings(supabase);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-5 font-heading text-lg font-bold text-ink">Configuración del sitio</h1>
      <SettingsForm whatsappNumber={settings.whatsappNumber} whatsappMessage={settings.whatsappMessage} />
    </div>
  );
}
