import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { productLeadImage } from '@/lib/product-image';
import { siteConfig } from '@/lib/site-config';
import { getSiteSettings, buildWhatsAppUrl } from '@/lib/get-settings';
import type { Product } from '@/lib/types';

// Hero de la home. Las fotos que se ven a la derecha vienen de los
// productos listados en siteConfig.hero.featuredProductSlugs — cambia esa
// lista para destacar otros productos, no hace falta tocar este archivo.
export default async function Hero() {
  const supabase = createClient();
  const settings = await getSiteSettings(supabase);
  const wa = buildWhatsAppUrl(settings.whatsappNumber, settings.whatsappMessage);

  const { data: featured } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .in('slug', siteConfig.hero.featuredProductSlugs);

  const ordered = siteConfig.hero.featuredProductSlugs
    .map((slug) => (featured ?? []).find((p: Product) => p.slug === slug))
    .filter(Boolean) as Product[];

  return (
    <section
      className="pt-[60px]"
      style={{ backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, #BEE1CE 100%)' }}
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-5 pb-16 md:grid-cols-2">
        <div>
          <span
            className="mb-4 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide shadow-sm"
            style={{ color: '#0D9488' }}
          >
            {siteConfig.hero.badge}
          </span>
          <h1 className="font-heading text-hero font-bold leading-tight text-ink">
            {siteConfig.hero.titleLine1}
            <br />
            <span className="text-gradient">{siteConfig.hero.titleLine2Accent}</span>
            <br />
            {siteConfig.hero.titleLine3}
          </h1>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/productos"
              className="flex h-[54px] items-center rounded-[10px] px-7 text-[14.4px] font-extrabold uppercase tracking-wide text-white"
              style={{ backgroundImage: 'linear-gradient(90deg, #27CAAF 0%, #0D9488 100%)' }}
            >
              {siteConfig.hero.ctaPrimary}
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[54px] items-center rounded-[10px] border border-border bg-white px-7 text-[14.4px] font-extrabold uppercase tracking-wide text-ink"
            >
              {siteConfig.hero.ctaSecondary}
            </a>
          </div>
        </div>

        {ordered.length > 0 ? (
          // Los frascos flotan directo sobre el degradado del hero (sin
          // tarjeta cuadrada de fondo) — la foto de cada producto trae su
          // propio fondo de estudio "quemado" en el PNG, así que le
          // aplicamos una máscara ovalada que difumina las esquinas hacia
          // transparente y deja solo el frasco visible, más una sombra
          // suave abajo para que no se sientan flotando en el vacío.
          <div className="relative flex h-96 items-end justify-center">
            {ordered.slice(0, 2).map((product, i) => {
              const image = productLeadImage(product);
              const sizing = i === 0 ? 'h-[18rem] w-40 -mr-6' : 'h-[22rem] w-48';
              const animClass = i === 0 ? 'anim-float-bottle-1' : 'anim-float-bottle-2';
              return (
                <Link
                  key={product.id}
                  href={`/productos/${product.slug}`}
                  className={`relative ${sizing} ${animClass}`}
                  style={{ zIndex: i === 0 ? 1 : 2 }}
                >
                  <span className="absolute inset-x-3 bottom-1 h-5 rounded-full bg-ink/10 blur-md" />
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="relative object-contain drop-shadow-2xl"
                      style={{
                        maskImage: 'radial-gradient(ellipse 36% 72% at 50% 46%, black 18%, transparent 92%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 36% 72% at 50% 46%, black 18%, transparent 92%)',
                      }}
                      sizes="220px"
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-theme border-2 border-dashed border-primary/30 bg-white/60 text-sm text-muted">
            [ Foto(s) de producto — reemplaza este bloque en components/Hero.tsx ]
          </div>
        )}
      </div>
    </section>
  );
}
