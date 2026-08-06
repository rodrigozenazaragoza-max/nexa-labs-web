'use client';

import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

type SortKey = 'name' | 'price-asc' | 'price-desc';

function minPrice(p: Product) {
  const variants = p.variants ?? [];
  return variants.length > 0 ? Math.min(...variants.map((v) => v.price_mxn)) : p.price_mxn;
}

function isAvailable(p: Product) {
  const variants = p.variants ?? [];
  return variants.length > 0 ? variants.some((v) => v.stock > 0) : p.stock > 0;
}

// Barra de catálogo (buscador, filtros, orden, contador) + grid de
// tarjetas. Todo el filtrado/orden pasa en el navegador — los productos ya
// vienen cargados del servidor, así que se siente instantáneo.
export default function CatalogGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const visible = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (onlyAvailable) list = list.filter(isAvailable);
    list = [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return minPrice(a) - minPrice(b);
      if (sortBy === 'price-desc') return minPrice(b) - minPrice(a);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [products, query, sortBy, onlyAvailable]);

  return (
    <div>
      {/* Buscador y filtros más compactos en móvil (menos alto, menos margen)
          para que los productos aparezcan antes al entrar al catálogo. */}
      <div className="mb-3 flex flex-nowrap items-center gap-2 sm:mb-6 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted sm:left-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar péptidos..."
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none sm:py-3 sm:pl-11"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          aria-label="Filtros"
          className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm font-medium transition sm:px-4 sm:py-3 ${
            showFilters ? 'border-primary bg-primary-light text-primary' : 'border-border text-ink hover:border-primary'
          }`}
        >
          <SlidersHorizontal size={15} /> <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-theme border border-border bg-surface px-4 py-3 text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
            Solo disponibles
          </label>
          <label className="flex items-center gap-2 text-muted">
            Ordenar
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-theme border border-border bg-white px-2.5 py-1.5 text-xs text-ink"
            >
              <option value="name">Nombre A-Z</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </label>
        </div>
      )}

      <p className="mb-2.5 text-xs text-muted sm:mb-4">{visible.length} artículos</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
