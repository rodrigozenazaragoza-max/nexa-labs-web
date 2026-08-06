import Image from 'next/image';
import { Mail, Phone, Clock } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import NewsletterFooterForm from './NewsletterFooterForm';

// Footer en verde menta claro (mismo fondo que los headers de sección,
// --color-primary-light) con texto en tinta — pedido de Rod para que el
// cierre de la página haga juego con el resto del sitio en vez del bloque
// azul oscuro anterior. Estructura por columnas estilo exomapeptides.mx:
// logo + contacto, 3 columnas de links, newsletter, y bloque final de
// Cumplimiento + aviso legal.
export default function Footer({ whatsappNumber, whatsappMessage }: { whatsappNumber: string; whatsappMessage: string }) {
  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <footer className="bg-primary-light text-ink">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
          <div className="col-span-2 sm:col-span-1">
            <div className="inline-block rounded-theme border border-primary/30 bg-white px-3 py-2">
              <Image src="/logo.png" alt={siteConfig.brand.name} width={424} height={144} className="h-8 w-auto" />
            </div>
            <p className="mt-3 max-w-[180px] text-xs leading-relaxed text-muted">
              Péptidos de investigación (RUO) verificados por lote, para laboratorios en México.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-ink/80">
              <li>
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-dark">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-primary-dark">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11a16.4 16.4 0 0 1-1.62-.6c-2.86-1.24-4.72-4.13-4.87-4.32-.14-.2-1.17-1.55-1.17-2.96 0-1.4.73-2.08 1-2.37.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.13.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.28.36-.23.6-.14.24.09 1.55.73 1.82.87.27.14.45.2.51.32.07.12.07.68-.17 1.35Z" />
                  </svg>
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2"><Mail size={13} className="shrink-0 text-primary-dark" /> {siteConfig.contact.email}</li>
              <li className="flex items-center gap-2"><Phone size={13} className="shrink-0 text-primary-dark" /> {siteConfig.contact.phone}</li>
              <li className="flex items-center gap-2"><Clock size={13} className="shrink-0 text-primary-dark" /> {siteConfig.contact.hours}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary-dark">Tienda</h4>
            <ul className="space-y-2 text-sm text-ink/80">
              <li><a href="/productos" className="hover:text-primary-dark">Catálogo</a></li>
              <li><a href="/#cumplimiento" className="hover:text-primary-dark">Certificados</a></li>
              <li><a href="/herramientas" className="hover:text-primary-dark">Herramientas</a></li>
              <li><a href="/herramientas/calculadora" className="hover:text-primary-dark">Calculadora de reconstitución</a></li>
              <li><a href="/faq" className="hover:text-primary-dark">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary-dark">Cuenta</h4>
            <ul className="space-y-2 text-sm text-ink/80">
              <li><a href="/mi-cuenta" className="hover:text-primary-dark">Mi cuenta</a></li>
              <li><a href="/login" className="hover:text-primary-dark">Iniciar sesión</a></li>
              <li><a href="/rastrea-pedido" className="hover:text-primary-dark">Rastrear pedido</a></li>
              <li><a href="/devoluciones" className="hover:text-primary-dark">Devoluciones</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary-dark">Empresa</h4>
            <ul className="space-y-2 text-sm text-ink/80">
              <li><a href="/nosotros" className="hover:text-primary-dark">Nosotros</a></li>
              <li><a href="/contacto" className="hover:text-primary-dark">Contacto</a></li>
              <li><a href="/terminos" className="hover:text-primary-dark">Términos y Condiciones</a></li>
              <li><a href="/privacidad" className="hover:text-primary-dark">Política de Privacidad</a></li>
              <li><a href="/envios" className="hover:text-primary-dark">Envíos y Entregas</a></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary-dark">Recibe novedades</h4>
            <p className="mb-3 text-xs text-muted">Ofertas y lanzamientos a tu correo.</p>
            <NewsletterFooterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-primary/15">
        <div id="cumplimiento" className="mx-auto max-w-7xl px-6 py-6">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-primary-dark">Cumplimiento</h4>
          <ul className="max-w-3xl space-y-1.5 text-[11px] leading-relaxed text-muted">
            <li>• Etiquetado &quot;For Research Use Only — Not for Human or Animal Use&quot; en cada producto.</li>
            <li>• Ninguna página incluye dosis, vía de administración ni beneficios de salud.</li>
            <li>• Nos reservamos el derecho de rechazar pedidos con intención aparente de uso humano.</li>
          </ul>
          <p className="mt-4 max-w-2xl text-[11px] leading-relaxed text-muted">
            {siteConfig.brand.name} — {siteConfig.contact.address}. Los productos son compuestos de
            referencia para investigación científica (RUO). No son medicamentos, suplementos ni
            productos de consumo humano.
          </p>
          <p className="mt-3 text-[11px] text-muted/80">© {new Date().getFullYear()} {siteConfig.brand.name}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
