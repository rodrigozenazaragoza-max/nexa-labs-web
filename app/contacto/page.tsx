import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import SectionHeader from '@/components/SectionHeader';
import { createClient } from '@/lib/supabase/server';
import { getSectionHeaderImage } from '@/lib/section-header-image';

export default async function ContactoPage() {
  const supabase = createClient();
  const headerImage = await getSectionHeaderImage(supabase);

  return (
    <div>
      <SectionHeader crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Contacto' }]} title="Contacto" image={headerImage} />
      <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="-mt-8 mb-8 max-w-lg text-sm text-muted">
        ¿Tienes alguna duda sobre tus productos o pedido? Escríbenos y con gusto te asistiremos.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6 rounded-theme border border-border p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink">Información de contacto</h2>
          <div className="flex items-start gap-3 text-sm">
            <Phone size={18} className="mt-0.5 text-primary" />
            <div>
              <p className="text-xs text-muted">Teléfono</p>
              <p className="font-medium">{siteConfig.contact.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Mail size={18} className="mt-0.5 text-primary" />
            <div>
              <p className="text-xs text-muted">Correo electrónico</p>
              <p className="font-medium">{siteConfig.contact.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin size={18} className="mt-0.5 text-primary" />
            <div>
              <p className="text-xs text-muted">Dirección</p>
              <p className="font-medium">{siteConfig.contact.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Clock size={18} className="mt-0.5 text-primary" />
            <div>
              <p className="text-xs text-muted">Horario de atención</p>
              <p className="font-medium">{siteConfig.contact.hours}</p>
            </div>
          </div>
        </div>

        <form className="space-y-4 rounded-theme border border-border p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink">Envíanos un mensaje</h2>
          <input placeholder="Nombre completo" className="w-full rounded-theme border border-border px-4 py-3 text-sm" />
          <input type="email" placeholder="Correo electrónico" className="w-full rounded-theme border border-border px-4 py-3 text-sm" />
          <textarea placeholder="Tu mensaje" rows={4} className="w-full rounded-theme border border-border px-4 py-3 text-sm" />
          {/* TODO: conecta este form a un endpoint real (ej. Resend, Formspree, o tu propia API route) */}
          <button type="button" className="w-full rounded-theme bg-primary py-3 text-sm font-semibold text-white">
            Enviar
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
