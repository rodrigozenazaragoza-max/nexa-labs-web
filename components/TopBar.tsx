import { Mail, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export default function TopBar() {
  return (
    <div className="hidden bg-primary-dark py-2 text-xs text-white md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <p>
          <strong>Envío gratis</strong> en pedidos mayores a $
          {siteConfig.freeShippingThresholdMxn} a toda la República Mexicana.
        </p>
        <div className="flex items-center gap-5">
          <span>{siteConfig.announcementBar.discreteText}</span>
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
