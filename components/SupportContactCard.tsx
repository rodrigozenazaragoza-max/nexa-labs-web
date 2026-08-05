import { Mail } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import { siteConfig } from '@/lib/site-config';

export default function SupportContactCard({
  title,
  subtitle,
  whatsappNumber,
  whatsappMessage,
  links,
}: {
  title: string;
  subtitle: string;
  whatsappNumber: string;
  whatsappMessage: string;
  links?: { label: string; href: string }[];
}) {
  return (
    <div className="rounded-theme border border-border bg-surface p-8 text-center">
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
        <Mail size={18} />
      </span>
      <p className="font-heading text-base font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      <p className="mt-3 text-sm font-semibold text-ink">{siteConfig.contact.email}</p>

      <div className="mt-4 flex justify-center">
        <WhatsAppButton phone={whatsappNumber} message={whatsappMessage} />
      </div>

      {links && links.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-theme border border-border bg-white px-4 py-2 text-xs font-semibold text-ink hover:border-primary">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
