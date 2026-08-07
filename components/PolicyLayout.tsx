import SectionHeader from './SectionHeader';
import { createClient } from '@/lib/supabase/server';
import { getSectionHeaderImage } from '@/lib/section-header-image';
import { siteConfig } from '@/lib/site-config';

export default async function PolicyLayout({
  title,
  updated,
  children,
  contactQuestion,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
  contactQuestion?: string;
}) {
  const supabase = createClient();
  const headerImage = await getSectionHeaderImage();

  return (
    <div>
      <SectionHeader crumbs={[{ label: 'Inicio', href: '/' }, { label: title }]} title={title} image={headerImage} />
      <div className="mx-auto max-w-3xl px-6 py-14">
        {updated && <p className="-mt-4 mb-4 text-xs text-muted">Última actualización: {updated}</p>}
        <div className="prose-policy space-y-5 text-sm leading-relaxed text-muted [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
          {children}
        </div>
      </div>

      {contactQuestion && (
        <div className="border-t border-border bg-surface py-6 text-center">
          <p className="text-sm text-muted">
            {contactQuestion}{' '}
            <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-primary hover:underline">
              Contáctanos en {siteConfig.contact.email}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
