import Image from 'next/image';
import { ShieldCheck, Truck, FileCheck2, Lock } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

// Footer con estructura ordenada por columnas (inspirada en el patrón de
// tiendas como swisschems.is), pero con identidad propia de Nexa Labs:
// fondo oscuro (--color-ink) en vez de blanco, franja de confianza con los
// mismos íconos del trustBar de arriba del sitio, y acentos en el verde de
// marca en vez del rojo/negro de otras tiendas.
const TRUST_ICONS = [
  { icon: Truck, label: 'Envío rápido y discreto' },
  { icon: FileCheck2, label: 'COA por lote verificable' },
  { icon: Lock, label: 'Compra 100% segura' },
  { icon: ShieldCheck, label: 'Solo investigación (RUO)' },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TRUST_ICONS.map((t) => (
            <div key={t.label} className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-primary">
                <t.icon size={15} />
              </span>
              <p className="text-[11px] font-medium leading-tight text-white/80">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
          <div className="col-span-2 sm:col-span-1">
            <Image src="/logo.png" alt={siteConfig.brand.name} width={424} height={144} className="h-10 w-auto brightness-0 invert" />
            <p className="mt-3 max-w-[180px] text-xs leading-relaxed text-white/60">
              Péptidos de investigación (RUO) verificados por lote, para laboratorios en México.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">Tienda</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li><a href="/productos" className="hover:text-white">Catálogo</a></li>
              <li><a href="/#compliance" className="hover:text-white">Certificados</a></li>
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">Cuenta</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li><a href="/mi-cuenta" className="hover:text-white">Mi cuenta</a></li>
              <li><a href="/login" className="hover:text-white">Iniciar sesión</a></li>
              <li><a href="/rastrea-pedido" className="hover:text-white">Rastrear pedido</a></li>
              <li><a href="/devoluciones" className="hover:text-white">Devoluciones</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">Empresa</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li><a href="/nosotros" className="hover:text-white">Nosotros</a></li>
              <li><a href="/contacto" className="hover:text-white">Contacto</a></li>
              <li><a href="/terminos" className="hover:text-white">Términos y Condiciones</a></li>
              <li><a href="/privacidad" className="hover:text-white">Política de Privacidad</a></li>
              <li><a href="/envios" className="hover:text-white">Envíos y Entregas</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">Contacto</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>{siteConfig.contact.email}</li>
              <li>{siteConfig.contact.phone}</li>
              <li>{siteConfig.contact.hours}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="max-w-2xl text-[11px] leading-relaxed text-white/50">
            {siteConfig.brand.name} — {siteConfig.contact.address}. Los productos son compuestos de
            referencia para investigación científica (RUO). No son medicamentos, suplementos ni
            productos de consumo humano.
          </p>
          <p className="mt-3 text-[11px] text-white/40">© {new Date().getFullYear()} {siteConfig.brand.name}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
