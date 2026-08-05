'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, X } from 'lucide-react';

export type FaqItem = {
  q: string;
  a: React.ReactNode;
  searchText: string;
};

export type FaqCategory = {
  name: string;
  intro?: React.ReactNode;
  items: FaqItem[];
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function FaqAccordion({
  categories,
  anchorMap,
}: {
  categories: FaqCategory[];
  anchorMap?: Record<string, string>;
}) {
  const [active, setActive] = useState(categories[0]?.name ?? '');
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Permite que un link externo (ej. la pantalla de "pedido recibido") caiga
  // directo en la pestaña correcta usando un hash como #rastrear-pedido.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const targetCategory = anchorMap?.[hash];
    if (targetCategory) {
      setActive(targetCategory);
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSearching = query.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = normalize(query.trim());
    return categories
      .map((cat): FaqCategory => ({
        name: cat.name,
        intro: cat.intro,
        items: cat.items.filter(
          (item) => normalize(item.q).includes(q) || normalize(item.searchText).includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, query, isSearching]);

  const visibleCategories = isSearching ? searchResults : categories.filter((c) => c.name === active);
  const totalMatches = isSearching ? searchResults.reduce((sum, c) => sum + c.items.length, 0) : null;

  function toggle(key: string) {
    setOpenKey((k) => (k === key ? null : key));
  }

  return (
    <div>
      <div className="relative mx-auto mb-6 max-w-xl">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca tu pregunta… ej. envío, devolución, pureza"
          className="w-full rounded-full border border-border bg-white py-3 pl-11 pr-11 text-sm shadow-sm focus:border-primary focus:outline-none"
        />
        {query && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {!isSearching && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActive(cat.name)}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                active === cat.name
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-border bg-white text-ink hover:border-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {isSearching && (
        <p className="mb-4 text-center text-sm text-muted">
          {totalMatches === 0
            ? `Sin resultados para "${query}" — intenta con otra palabra.`
            : `${totalMatches} resultado${totalMatches === 1 ? '' : 's'} para "${query}"`}
        </p>
      )}

      <div className="space-y-8">
        {visibleCategories.map((cat) => (
          <div key={cat.name}>
            {isSearching && (
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">{cat.name}</h3>
            )}
            {!isSearching && cat.intro && <div className="mb-6">{cat.intro}</div>}
            <div className="space-y-2">
              {cat.items.map((item) => {
                const key = `${cat.name}::${item.q}`;
                const open = openKey === key;
                return (
                  <div key={key} className="rounded-theme border border-border bg-white">
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-ink"
                    >
                      {item.q}
                      <Plus size={16} className={`shrink-0 text-primary transition-transform ${open ? 'rotate-45' : ''}`} />
                    </button>
                    {open && (
                      <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
