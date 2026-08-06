'use client';

// Dibujos de las tres jeringas de insulina, a escala relativa entre sí
// (la de 100 u es la más larga). Se eligen con un clic — ver la forma
// hace mucho más fácil reconocer cuál tienes en la mano que leer "0.3 mL".
export const SYRINGES = [
  { units: 30, ml: 0.3, label: '30 unidades', sub: '0.3 mL · la más chica' },
  { units: 50, ml: 0.5, label: '50 unidades', sub: '0.5 mL · intermedia' },
  { units: 100, ml: 1, label: '100 unidades', sub: '1 mL · la más común' },
] as const;

export type SyringeUnits = (typeof SYRINGES)[number]['units'];

function SyringeDrawing({ units, active }: { units: number; active: boolean }) {
  // Largo del barril proporcional a la capacidad, para que se vean distintas.
  const barrelW = units === 30 ? 74 : units === 50 ? 94 : 120;
  const ticks = units === 30 ? 6 : units === 50 ? 5 : 10;
  const stroke = active ? 'var(--color-primary-dark)' : '#9aa5b1';
  const fill = active ? 'var(--color-primary-light)' : '#f3f5f7';

  return (
    <svg viewBox={`0 0 ${barrelW + 46} 30`} className="h-8 w-full" role="img" aria-label={`Jeringa de ${units} unidades`}>
      {/* aguja */}
      <line x1="0" y1="15" x2="16" y2="15" stroke={stroke} strokeWidth="1.5" />
      {/* cono */}
      <path d={`M16 11 L22 8 L22 22 L16 19 Z`} fill={stroke} />
      {/* barril */}
      <rect x="22" y="7" width={barrelW} height="16" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* marcas */}
      {Array.from({ length: ticks - 1 }).map((_, i) => (
        <line
          key={i}
          x1={22 + (barrelW / ticks) * (i + 1)}
          y1="7"
          x2={22 + (barrelW / ticks) * (i + 1)}
          y2={i % 2 === 1 ? 17 : 13}
          stroke={stroke}
          strokeWidth="1"
        />
      ))}
      {/* émbolo */}
      <rect x={22 + barrelW} y="9" width="14" height="12" rx="1.5" fill={stroke} />
      <rect x={22 + barrelW + 14} y="4" width="4" height="22" rx="1.5" fill={stroke} />
    </svg>
  );
}

export default function SyringePicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (units: SyringeUnits) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {SYRINGES.map((s) => {
        const active = value === s.units;
        return (
          <button
            key={s.units}
            type="button"
            onClick={() => onChange(s.units)}
            aria-pressed={active}
            className={`rounded-theme border-2 p-3 text-left transition ${
              active ? 'border-primary bg-primary-light/40' : 'border-border bg-white hover:border-primary/50'
            }`}
          >
            <SyringeDrawing units={s.units} active={active} />
            <p className={`mt-2 text-sm font-bold ${active ? 'text-primary-dark' : 'text-ink'}`}>{s.label}</p>
            <p className="text-[11px] text-muted">{s.sub}</p>
          </button>
        );
      })}
    </div>
  );
}
