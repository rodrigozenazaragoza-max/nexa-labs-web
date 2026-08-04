'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-theme border border-border px-4 py-2 text-xs font-semibold text-ink hover:border-danger hover:text-danger disabled:opacity-60"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
      Cerrar sesión
    </button>
  );
}
