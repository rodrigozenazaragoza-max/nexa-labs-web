import { Mail, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export default function TopBar() {
  return (
    <div className="hidden bg-primary-dark py-2 text-xs text-white md:block">
      {/* El aviso de envío gratis va centrado en la barra completa
          (position: absolute) y el contacto anclado a la derecha — así el
          mensaje queda al centro real de la pantalla sin importar cuánto
          espacio ocupen el correo y el teléfono. */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-end px-6">
        <p className="pointer-events-none absolute inset-x-0 text-center font-bold">
          Envío gratis en pedidos mayores a ${siteConfig.freeShippingThresholdMxn} a toda la
          República Mexicana.
        </p>
        <div className="relative flex items-center gap-5 font-bold">
          <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-1.5">
            <Mail size={14} /> {siteConfig.contact.email}
          </a>
          <a href={`tel:${siteConfig.contact.phone}`} className="flex items-center gap-1.5">
            <Phone size={14} /> {siteConfig.contact.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
