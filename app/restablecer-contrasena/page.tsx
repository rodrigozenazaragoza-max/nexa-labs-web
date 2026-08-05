import { Suspense } from 'react';
import { KeyRound } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata = { title: `Restablecer contraseña | ${siteConfig.brand.name}` };

export default function RestablecerContrasenaPage() {
  return (
    <div className="bg-gradient-to-b from-ink to-[#1c2c4a] py-16">
      <div className="mx-auto max-w-md px-6">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <KeyRound size={22} />
          </span>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Nueva contraseña</p>
          <h1 className="mt-2 font-heading text-h2 font-bold text-white">Crea tu nueva contraseña</h1>
        </div>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
