'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { formatMxn } from '@/lib/format';
import type { ProductVariant } from '@/lib/types';

// Selector de presentación (5mg/10mg/...) con identidad propia — panel
// flotante con check + precio por opción, en vez del <select> nativo del
// navegador. Se usa en la tarjeta de producto y en la ficha de producto.
export default function PresentationSelect({
  variants,
  selectedId,
  onChange,
}: {
  variants: ProductVariant[];
  selectedId: string | undefined;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = variants.find((v) => v.id === selectedId);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-theme border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink transition hover:border-primary"
      >
        <span>{selected ? selected.label : 'Elige presentación'}</span>
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-theme border border-border bg-white py-1 shadow-lg">
          {variants.map((v) => {
            const isSelected = v.id === selectedId;
            return (
              <button
                key={v.id}
                type="button"
                disabled={v.stock <= 0}
                onClick={() => {
                  onChange(v.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected ? 'bg-primary-light' : 'hover:bg-surface'
                }`}
              >
                <Check size={13} className={isSelected ? 'text-primary' : 'text-transparent'} />
                <span className="flex-1 font-medium text-ink">{v.label}</span>
                <span className="font-price text-muted">
                  ${formatMxn(v.price_mxn)}{v.stock <= 0 ? ' · Agotado' : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
