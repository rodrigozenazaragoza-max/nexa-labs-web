'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Package, Plus, BarChart3, RotateCcw } from 'lucide-react';

export default function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return null;

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const linkClass = (href: string) =>
    `flex items-center gap-1.5 rounded-theme px-3 py-1.5 text-xs font-semibold ${
      pathname === href ? 'bg-primary-light text-primary' : 'text-muted hover:text-ink'
    }`;

  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 font-heading text-sm font-bold text-ink">
            <Package size={18} className="text-primary" /> Panel de administración
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <Link href="/admin" className={linkClass('/admin')}>Productos</Link>
            <Link href="/admin/reportes" className={linkClass('/admin/reportes')}>
              <BarChart3 size={13} /> Reportes
            </Link>
            <Link href="/admin/devoluciones" className={linkClass('/admin/devoluciones')}>
              <RotateCcw size={13} /> Devoluciones
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-1.5 rounded-theme bg-primary px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus size={14} /> Nuevo producto
          </Link>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-danger">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>
    </div>
  );
}
