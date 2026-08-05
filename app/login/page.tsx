import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: `Mi Cuenta | ${siteConfig.brand.name}` };

export default async function LoginPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/mi-cuenta');

  return (
    <div className="bg-gradient-to-b from-ink to-[#1c2c4a] py-16">
      <div className="mx-auto max-w-md px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Acceso de clientes</p>
          <h1 className="mt-2 font-heading text-h2 font-bold text-white">Tu cuenta Nexa Labs</h1>
          <p className="mt-2 text-sm text-white/60">
            Rastrea tus pedidos, guarda tus datos y agiliza tu próxima compra.
          </p>
        </div>

        <LoginFormWrapper />

        <div className="mt-6 flex items-start gap-2 rounded-theme border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
          <KeyRound size={15} className="mt-0.5 shrink-0 text-primary" />
          <p>
            <span className="font-semibold text-white">Cuenta de prueba para Rod:</span> correo{' '}
            <code className="text-primary">demo@nexalabs.mx</code>, contraseña{' '}
            <code className="text-primary">NexaDemo2026!</code> — ya tiene un pedido de ejemplo
            adentro para probar cómo se ve.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/40">
          <ShieldCheck size={13} /> Tu información está protegida y nunca se comparte con terceros.
        </div>
      </div>
    </div>
  );
}

function LoginFormWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
