'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, Mail, HelpCircle, PackageSearch, RotateCcw } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { siteConfig } from '@/lib/site-config';

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/#compliance', label: 'Certificados' },
];

// Dropdown "AYUDA" — reemplaza los links sueltos de FAQ y Contacto, estilo
// el menú "HELP" de swisschems.is: un solo punto de entrada con las
// herramientas de soporte adentro.
const HELP_LINKS = [
  { href: '/contacto', label: 'Contáctanos', desc: 'Escríbenos tus dudas', icon: Mail },
  { href: '/faq', label: 'FAQs', desc: 'Preguntas frecuentes', icon: HelpCircle },
  { href: '/rastrea-pedido', label: 'Rastrea tu pedido', desc: 'Estado y guía de envío', icon: PackageSearch },
  { href: '/devoluciones', label: 'Devoluciones', desc: 'Solicita un cambio o reembolso', icon: RotateCcw },
];

export default function Header() {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpenMobile, setHelpOpenMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
        <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
          {/* Logo real — reemplaza public/logo.png para cambiarlo */}
          <Image src="/logo.png" alt={siteConfig.brand.name} width={424} height={144} className="h-14 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-3 text-xs font-bold uppercase tracking-wide text-ink md:flex">
          {NAV_LINKS.map((link, i) => (
            <span key={link.href} className="flex items-center gap-3">
              {i > 0 && <span className="text-primary">•</span>}
              <Link href={link.href} className="hover:text-primary">{link.label}</Link>
            </span>
          ))}
          <span className="text-primary">•</span>

          {/* Dropdown de AYUDA — se abre al pasar el mouse (group-hover),
              igual que el patrón de swisschems.is. */}
          <div className="group relative">
            <button className="flex items-center gap-1 py-2 uppercase hover:text-primary">
              Ayuda
              <ChevronDown size={13} className="transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-64 translate-y-1 rounded-theme border border-border bg-white p-2 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {HELP_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-start gap-3 rounded-theme px-3 py-2.5 normal-case tracking-normal hover:bg-surface"
                >
                  <item.icon size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span>
                    <span className="block text-xs font-bold text-ink">{item.label}</span>
                    <span className="block text-[11px] font-normal text-muted">{item.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-4 text-ink">
          <button aria-label="Buscar" className="hidden md:block">
            <Search size={20} />
          </button>
          <Link href="/mi-cuenta" aria-label="Mi cuenta" className="hidden md:block">
            <User size={20} />
          </Link>
          <button aria-label="Carrito" onClick={openCart} className="relative">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
          <button
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-white px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-theme px-2 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-surface hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={() => setHelpOpenMobile((v) => !v)}
                className="flex w-full items-center justify-between rounded-theme px-2 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-surface hover:text-primary"
              >
                Ayuda
                <ChevronDown size={16} className={`transition-transform ${helpOpenMobile ? 'rotate-180' : ''}`} />
              </button>
              {helpOpenMobile && (
                <ul className="ml-2 flex flex-col gap-0.5 border-l border-border pl-3">
                  {HELP_LINKS.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-theme px-2 py-2.5 text-xs font-semibold normal-case text-muted hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
