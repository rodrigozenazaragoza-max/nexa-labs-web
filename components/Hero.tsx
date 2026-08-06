import Image from 'next/image';
import Link from 'next/link';
import { productLeadImage } from '@/lib/product-image';
import { siteConfig } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/get-settings';
import { getAllProducts, getSettings } from '@/lib/data';
import type { Product } from '@/lib/types';

// Recortes con transparencia real para el hero (le quitamos el fondo con
// GrabCut, viven en public/hero/). Clave = slug del producto. Para
// destacar un producto nuevo con el look "flotando", agrega su PNG
// recortado aquí — si no está, se usa la foto normal en una tarjeta.
// Recortes hechos con remove.bg (IA de verdad, no mi GrabCut manual) —
// transparencia limpia confirmada. Clave = slug del producto.
const HERO_CUTOUTS: Record<string, string> = {
  retatrutida: '/hero/retatrutide-v3.png',
  'mots-c': '/hero/mots-c-v3.png',
};

// Hero de la home. Las fotos que se ven a la derecha vienen de los
// productos listados en siteConfig.hero.featuredProductSlugs — cambia esa
// lista para destacar otros productos, no hace falta tocar este archivo.
export default async function Hero() {
  // Ambas salen de las consultas memoizadas: el layout ya las pidió en esta
  // misma petición, así que aquí no se hace ningún viaje extra a Supabase.
  const [settings, allProducts] = await Promise.all([getSettings(), getAllProducts()]);
  const wa = buildWhatsAppUrl(settings.whatsappNumber, settings.whatsappMessage);

  const ordered = siteConfig.hero.featuredProductSlugs
    .map((slug) => allProducts.find((p: Product) => p.slug === slug))
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
          // Los frascos del hero usan recortes reales con transparencia
          // (public/hero/*.png — le quité el fondo con GrabCut, no son las
          // mismas fotos con fondo "horneado" que se usan en las tarjetas
          // de producto) para que floten sobre el degradado sin tarjeta ni
          // recuadro visible. Si agregas un producto nuevo a
          // featuredProductSlugs, necesita su propio recorte en
          // public/hero/ (mismo nombre que el slug) — si no existe, cae al
          // tratamiento de tarjeta de antes para no romper la página.
          <div className="relative flex h-[33rem] items-end justify-center gap-2">
            {ordered.slice(0, 3).map((product, i, arr) => {
              const heroImage = HERO_CUTOUTS[product.slug];
              const fallbackImage = productLeadImage(product);
              const isCenter = i === Math.floor((arr.length - 1) / 2) && arr.length > 1;
              // +10% sobre el tamaño anterior (27rem/21rem, 12rem/10rem)
              const height = isCenter ? 'h-[29.7rem]' : 'h-[23.1rem]';
              const width = isCenter ? 'w-[13.2rem]' : 'w-[11rem]';
              const animClass = i === 0 ? 'anim-float-bottle-1' : 'anim-float-bottle-2';
              return (
                <Link
                  key={product.id}
                  href={`/productos/${product.slug}`}
                  className={`relative ${width} flex-shrink-0 ${height} ${animClass}`}
                  style={{ zIndex: isCenter ? 2 : 1 }}
                >
                  {heroImage ? (
                    // unoptimized: el optimizador de imágenes de Netlify le
                    // aplana el canal alfa a estos PNG (por eso salía el
                    // recuadro aunque el archivo fuente ya estaba bien) —
                    // sirviéndolo tal cual se respeta la transparencia real.
                    <Image
                      src={heroImage}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain drop-shadow-2xl"
                      sizes="260px"
                    />
                  ) : fallbackImage ? (
                    <span className="absolute inset-0 overflow-hidden rounded-theme bg-primary-light shadow-xl">
                      <Image src={fallbackImage} alt={product.name} fill className="object-cover" sizes="260px" />
                    </span>
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
