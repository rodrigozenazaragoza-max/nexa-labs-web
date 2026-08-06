import { ShieldCheck, FlaskConical, Lock, Truck, PackageCheck, TestTube2, Headset } from 'lucide-react';
import PaymentLogos from './PaymentLogos';

// Accesos rápidos (envío, devoluciones, lab tested, soporte) — se muestran
// en la columna izquierda de la página de producto, debajo de la foto,
// para equilibrar la altura de las dos columnas y eliminar el espacio
// blanco antes de las tabs de Overview.
export function ProductQuickLinks() {
  const quickLinks = [
    { icon: Truck, label: 'Envíos', desc: 'Nacional 1–3 días hábiles', href: '/envios' },
    { icon: PackageCheck, label: 'Devoluciones', desc: '30 días sin complicaciones', href: '/devoluciones' },
    { icon: TestTube2, label: 'Lab Tested', desc: 'Cada lote con COA', href: '/faq' },
    { icon: Headset, label: 'Soporte', desc: 'Aquí para ayudarte', href: '/contacto' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {quickLinks.map(({ icon: Icon, label, desc, href }) => (
        <a key={label} href={href} className="rounded-theme border border-border p-3 transition hover:border-primary">
          <Icon size={16} className="mb-1.5 text-primary" />
          <p className="text-xs font-semibold text-ink">{label}</p>
          <p className="mt-0.5 text-[11px] text-muted">{desc}</p>
        </a>
      ))}
    </div>
  );
}

// Badges de confianza (pureza, RUO, compra segura) — columna izquierda,
// debajo de los accesos rápidos.
export function ProductTrustBadges() {
  const badges = [
    { icon: ShieldCheck, label: '99% Pureza Garantizada' },
    { icon: FlaskConical, label: 'Solo Uso en Investigación' },
    { icon: Lock, label: 'Compra Segura' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 rounded-theme bg-surface p-4 text-center">
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex flex-col items-center gap-1.5">
          <Icon size={18} className="text-primary" />
          <span className="text-[11px] font-medium text-ink">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Métodos de pago aceptados — columna derecha, sube justo después de la
// caja de compra / cross-sell.
export default function ProductTrustRow() {
  return (
    <div className="mt-8">
      <div className="rounded-theme border border-border p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
          <Lock size={13} /> Métodos de pago aceptados
        </p>
        <PaymentLogos />
        <p className="mt-2 text-[11px] text-muted">Tu información está protegida con cifrado de 256 bits.</p>
      </div>
    </div>
  );
}
