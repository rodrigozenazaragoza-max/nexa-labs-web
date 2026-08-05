import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import AccountDetailsForm from '@/components/account/AccountDetailsForm';

export const metadata = { title: `Datos de mi cuenta | ${siteConfig.brand.name}` };
export const dynamic = 'force-dynamic';

export default async function DatosCuentaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = (user?.user_metadata?.full_name as string) || '';
  const email = user?.email ?? '';

  return (
    <div>
      <h1 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-ink">Datos de mi cuenta</h1>
      <AccountDetailsForm initialName={name} initialEmail={email} />
    </div>
  );
}
