import { redirect } from 'next/navigation';
import { User as UserIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AccountSidebar from '@/components/account/AccountSidebar';

export const dynamic = 'force-dynamic';

export default async function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/mi-cuenta');

  const name = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Cliente';

  return (
    <div className="bg-surface py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-center gap-4 rounded-theme border border-border bg-white p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <UserIcon size={22} />
          </span>
          <div>
            <p className="font-heading text-base font-bold text-ink">Hola, {name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <AccountSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
