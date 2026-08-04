'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductCarousel from './ProductCarousel';
import type { Product } from '@/lib/types';

// Sección "Categoría de producto" — tabs de categoría + carrusel de
// productos de la categoría activa, estilo SwissChems. Recibe los
// productos ya agrupados por categoría (agrupados en el servidor) para no
// tener que volver a pedirlos al cambiar de tab.
export default function CategoryTabsSection({
  productsByCategory,
}: {
  productsByCategory: Record<string, Product[]>;
}) {
  const categoryNames = Object.keys(productsByCategory);
  const [active, setActive] = useState(categoryNames[0] ?? '');

  if (categoryNames.length === 0) return null;

  return (
    <section className="bg-primary-light py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="font-heading text-h2 font-bold text-ink">Categoría de producto</h2>
          <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-primary" />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                active === cat
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-border bg-white text-ink hover:border-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-10">
          <ProductCarousel products={productsByCategory[active] ?? []} />
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/productos"
            className="rounded-theme bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-primary-dark"
          >
            Explorar catálogo →
          </Link>
        </div>
      </div>
    </section>
  );
}
