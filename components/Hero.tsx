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
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 md:grid-cols-2">
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
          // Las fotos de producto no son PNGs recortados — traen su propio
          // fondo de estudio "horneado" en la imagen (blanco/menta muy
          // pálido), distinto al degradado del hero. Antes las tarjetas
          // usaban bg-primary-light, que es más verde que la foto y se veía
          // como un recuadro pegado. Ahora ponemos un "glow" radial detrás,
          // del mismo tono pálido que trae la foto, que se difumina hacia
          // el degradado del hero — así el frasco se siente flotando en vez
          // de encerrado en una tarjeta.
          <div className="relative flex h-[30rem] items-end justify-center gap-5">
            <div
              className="absolute inset-[-3rem] -z-10 blur-2xl"
              style={{
                background:
                  'radial-gradient(ellipse 60% 65% at 50% 45%, #f6faf8 0%, rgba(246,250,248,0) 72%)',
              }}
            />
            {ordered.slice(0, 3).map((product, i, arr) => {
              const image = productLeadImage(product);
              const isCenter = i === Math.floor((arr.length - 1) / 2) && arr.length > 1;
              const height = isCenter ? 'h-[27rem]' : 'h-[21rem]';
              const rotate = i === 0 ? '-rotate-2' : i === arr.length - 1 ? 'rotate-2' : 'rotate-0';
              const animClass = i === 0 ? 'anim-float-bottle-1' : 'anim-float-bottle-2';
              return (
                <Link
                  key={product.id}
                  href={`/productos/${product.slug}`}
                  className={`relative w-44 flex-shrink-0 ${height} ${rotate} ${animClass} overflow-hidden rounded-theme shadow-xl transition-transform hover:rotate-0`}
                  style={{ zIndex: isCenter ? 2 : 1, backgroundColor: '#f6faf8' }}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="260px"
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
