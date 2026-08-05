'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

// Carrusel horizontal de productos — muestra unos cuantos a la vez con
// flechas para "girar" y ver más, igual que el carrusel de "Most Popular"
// en swisschems.is. Usa scroll nativo (snap) en vez de una librería para
// mantener el proyecto ligero.
export default function ProductCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-carousel-card]');
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div
            key={p.id}
            data-carousel-card
            className="w-[calc(50%-8px)] flex-shrink-0 snap-start sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {products.length > 4 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scroll(-1)}
            className="absolute left-0 top-[35%] hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white p-2 text-ink shadow-md transition hover:bg-surface sm:flex"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => scroll(1)}
            className="absolute right-0 top-[35%] hidden translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white p-2 text-ink shadow-md transition hover:bg-surface sm:flex"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </div>
  );
}
