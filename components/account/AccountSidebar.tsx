'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, MapPin, UserCog } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';

const LINKS = [
  { href: '/mi-cuenta', label: 'Resumen', icon: LayoutDashboard },
  { href: '/mi-cuenta/pedidos', label: 'Mis pedidos', icon: Package },
  { href: '/mi-cuenta/direcciones', label: 'Mis direcciones', icon: MapPin },
  { href: '/mi-cuenta/datos', label: 'Datos de mi cuenta', icon: UserCog },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 md:w-56">
      <nav className="rounded-theme border border-border bg-white p-2">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-theme px-3.5 py-2.5 text-sm font-semibold transition ${
                active ? 'bg-primary-light text-primary-dark' : 'text-muted hover:bg-surface hover:text-ink'
              }`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-2 rounded-theme border border-border bg-white p-2">
        <LogoutButton full />
      </div>
    </aside>
  );
}
