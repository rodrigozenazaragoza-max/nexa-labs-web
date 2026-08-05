import { KeyRound, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata = { title: `Recuperar contraseña | ${siteConfig.brand.name}` };

export default function RecuperarPage() {
  return (
    <div className="bg-gradient-to-b from-ink to-[#1c2c4a] py-16">
      <div className="mx-auto max-w-md px-6">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <KeyRound size={22} />
          </span>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Recuperar acceso</p>
          <h1 className="mt-2 font-heading text-h2 font-bold text-white">¿Olvidaste tu contraseña?</h1>
          <p className="mt-2 text-sm text-white/60">
            Ingresa el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/40">
          <ShieldCheck size={13} /> El enlace expira por seguridad después de un tiempo limitado.
        </div>
      </div>
    </div>
  );
}
