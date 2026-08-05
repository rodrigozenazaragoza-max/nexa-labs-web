'use client';

import type { ProductVariant } from '@/lib/types';

// Selector de dosis en pills (estilo Exoma) para la página de detalle de
// producto. A diferencia de PresentationSelect (dropdown, usado en las
// tarjetas del catálogo) aquí todas las opciones se ven de un vistazo.
export default function PresentationPills({
  variants,
  selectedId,
  onChange,
}: {
  variants: ProductVariant[];
  selectedId?: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const isSelected = v.id === selectedId;
        const disabled = v.stock <= 0;
        return (
          <button
            key={v.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(v.id)}
            className={`rounded-theme border px-4 py-2.5 text-sm font-semibold transition ${
              isSelected
                ? 'border-ink bg-ink text-white'
                : disabled
                ? 'border-border text-muted line-through opacity-50'
                : 'border-border text-ink hover:border-ink'
            }`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
