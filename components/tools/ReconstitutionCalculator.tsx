'use client';

import { useMemo, useState } from 'react';
import { Search, Check, ChevronDown, Calculator, RotateCcw, AlertCircle } from 'lucide-react';
import SyringePicker, { SYRINGES } from './SyringePicker';

// Calculadora de reconstitución. Toda la matemática corre en el navegador
// (sin servidor, instantánea). Escala U-100: 1 mL = 100 unidades.
//
//   concentración (mg/mL) = mg del vial ÷ mL de agua
//   unidades a extraer    = (mcg objetivo ÷ (mg vial × 1000)) × mL agua × 100
//   dosis por vial        = (mg vial × 1000) ÷ mcg objetivo
//
// El resultado se presenta en lenguaje simple ("jala hasta la marca 10") en
// vez de puros números — la mayoría de los clientes no manejan mg/mL.
// Nota RUO: esto es aritmética, no un protocolo. No sugerimos dosis.

export type CalcVariant = { label: string; mg: number };
export type CalcProduct = { name: string; slug: string; variants: CalcVariant[] };

const WATER_OPTIONS = [1, 2, 3, 4, 5];

export default function ReconstitutionCalculator({ products }: { products: CalcProduct[] }) {
  const [query, setQuery] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [product, setProduct] = useState<CalcProduct | null>(null);
  const [variant, setVariant] = useState<CalcVariant | null>(null);
  const [waterMl, setWaterMl] = useState<number | null>(null);
  const [dose, setDose] = useState<string>('');
  const [doseUnit, setDoseUnit] = useState<'mcg' | 'mg'>('mcg');
  const [syringe, setSyringe] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<null | {
    units: number;
    volumeMl: number;
    dosesPerVial: number;
    concentration: number;
    mcgPerUnit: number;
    overflows: boolean;
    syringeUnits: number;
    productName: string;
    variantLabel: string;
    doseLabel: string;
    waterMl: number;
  }>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, products]);

  function pickProduct(p: CalcProduct) {
    setProduct(p);
    setVariant(p.variants.length === 1 ? p.variants[0] : null);
    setQuery(p.name);
    setListOpen(false);
    setResult(null);
  }

  function reset() {
    setQuery('');
    setProduct(null);
    setVariant(null);
    setWaterMl(null);
    setDose('');
    setDoseUnit('mcg');
    setSyringe(null);
    setErrors([]);
    setResult(null);
  }

  function calculate() {
    const missing: string[] = [];
    if (!product) missing.push('Elige tu péptido.');
    if (product && !variant) missing.push('Elige la presentación de tu vial.');
    if (!waterMl) missing.push('Elige cuánta agua bacteriostática le vas a agregar.');
    const d = parseFloat(dose);
    if (!d || d <= 0) missing.push('Escribe la cantidad que quieres extraer.');
    if (!syringe) missing.push('Elige el tamaño de tu jeringa.');

    const doseMcg = doseUnit === 'mg' ? d * 1000 : d;
    if (d > 0 && doseMcg > 10000) missing.push('La cantidad máxima que calculamos es 10 mg (10,000 mcg).');
    if (variant && d > 0 && doseMcg > variant.mg * 1000) {
      missing.push(`Tu vial de ${variant.label} solo tiene ${variant.mg * 1000} mcg en total — pide menos.`);
    }

    if (missing.length) {
      setErrors(missing);
      setResult(null);
      return;
    }

    setErrors([]);
    const mg = variant!.mg;
    const ml = waterMl!;
    const totalMcg = mg * 1000;
    const units = (doseMcg / totalMcg) * ml * 100;

    setResult({
      units,
      volumeMl: units / 100,
      dosesPerVial: Math.floor(totalMcg / doseMcg),
      concentration: mg / ml,
      mcgPerUnit: totalMcg / (ml * 100),
      overflows: units > syringe!,
      syringeUnits: syringe!,
      productName: product!.name,
      variantLabel: variant!.label,
      doseLabel: doseUnit === 'mg' ? `${d} mg` : `${d} mcg`,
      waterMl: ml,
    });
  }

  return (
    <div className="rounded-theme border border-border bg-white p-6 shadow-sm">
      {/* ---------- 1. Péptido ---------- */}
      <Step n={1} title="¿Qué péptido tienes?">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            placeholder="Escribe para buscar… ej. BPC-157"
            onChange={(e) => {
              setQuery(e.target.value);
              setListOpen(true);
              setProduct(null);
              setVariant(null);
              setResult(null);
            }}
            onFocus={() => setListOpen(true)}
            className="w-full rounded-theme border border-border py-2.5 pl-9 pr-9 text-sm font-medium text-ink focus:border-primary focus:outline-none"
          />
          <ChevronDown
            size={15}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-transform ${listOpen ? 'rotate-180' : ''}`}
          />
          {listOpen && filtered.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-60 overflow-y-auto rounded-theme border border-border bg-white py-1 shadow-lg">
              {filtered.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => pickProduct(p)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-surface"
                >
                  <span className="font-medium text-ink">{p.name}</span>
                  <span className="text-[11px] text-muted">
                    {p.variants.map((v) => v.label).join(' · ')}
                  </span>
                </button>
              ))}
            </div>
          )}
          {listOpen && filtered.length === 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-theme border border-border bg-white px-3 py-3 text-xs text-muted shadow-lg">
              No encontramos ese péptido en nuestro catálogo.
            </div>
          )}
        </div>

        {product && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-semibold text-muted">Presentación de tu vial:</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => {
                    setVariant(v);
                    setResult(null);
                  }}
                  className={`rounded-theme border px-4 py-2 text-sm font-semibold transition ${
                    variant?.label === v.label
                      ? 'border-ink bg-ink text-white'
                      : 'border-border text-ink hover:border-ink'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Step>

      {/* ---------- 2. Agua ---------- */}
      <Step n={2} title="¿Cuánta agua bacteriostática le vas a agregar?">
        <div className="flex flex-wrap gap-2">
          {WATER_OPTIONS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => {
                setWaterMl(w);
                setResult(null);
              }}
              className={`rounded-theme border px-4 py-2.5 text-sm font-semibold transition ${
                waterMl === w ? 'border-ink bg-ink text-white' : 'border-border text-ink hover:border-ink'
              }`}
            >
              {w} mL
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Más agua no cambia cuánto péptido hay en el vial — solo lo reparte en más rayitas de la
          jeringa, lo que hace más fácil medir con precisión. Lo más usado son 2 mL.
        </p>
      </Step>

      {/* ---------- 3. Cantidad ---------- */}
      <Step n={3} title="¿Cuánto quieres extraer?">
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={dose}
            placeholder="250"
            onChange={(e) => {
              setDose(e.target.value);
              setResult(null);
            }}
            className="w-full rounded-theme border border-border px-3 py-2.5 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
          />
          <div className="flex shrink-0 overflow-hidden rounded-theme border border-border">
            {(['mcg', 'mg'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => {
                  setDoseUnit(u);
                  setResult(null);
                }}
                className={`px-4 text-xs font-bold transition ${
                  doseUnit === u ? 'bg-ink text-white' : 'bg-white text-muted hover:text-ink'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          1 mg = 1,000 mcg. Puedes calcular hasta 10 mg.
        </p>
      </Step>

      {/* ---------- 4. Jeringa ---------- */}
      <Step n={4} title="¿Qué jeringa vas a usar?" last>
        <SyringePicker
          value={syringe}
          onChange={(u) => {
            setSyringe(u);
            setResult(null);
          }}
        />
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Las tres miden igual — la marca 10 es la misma cantidad en cualquiera. La chica solo
          separa más las rayitas. ¿No sabes cuál tienes? Es casi siempre la de 100 unidades.
        </p>
      </Step>

      {/* ---------- Acción ---------- */}
      {errors.length > 0 && (
        <div className="mt-5 rounded-theme border border-danger/30 bg-danger/5 px-4 py-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-danger">
            <AlertCircle size={15} /> Falta algo para calcular:
          </p>
          <ul className="mt-1.5 space-y-1 pl-6 text-xs text-danger">
            {errors.map((e) => (
              <li key={e} className="list-disc">{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={calculate}
          className="flex items-center gap-2 rounded-theme bg-primary px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-dark"
        >
          <Calculator size={16} /> Calcular
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-ink"
        >
          <RotateCcw size={13} /> Empezar de nuevo
        </button>
      </div>

      {/* ---------- Resultado ---------- */}
      {result && <Result r={result} />}
    </div>
  );
}

function Step({
  n,
  title,
  children,
  last,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? '' : 'mb-6 border-b border-dashed border-border pb-6'}>
      <p className="mb-3 flex items-center gap-2.5 text-sm font-bold text-ink">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary-dark">
          {n}
        </span>
        {title}
      </p>
      {children}
    </div>
  );
}

function Result({
  r,
}: {
  r: {
    units: number;
    volumeMl: number;
    dosesPerVial: number;
    concentration: number;
    mcgPerUnit: number;
    overflows: boolean;
    syringeUnits: number;
    productName: string;
    variantLabel: string;
    doseLabel: string;
    waterMl: number;
  };
}) {
  const pct = Math.min(100, (r.units / r.syringeUnits) * 100);
  const marks = r.syringeUnits === 30 ? 6 : r.syringeUnits === 50 ? 5 : 10;
  const rounded = Math.round(r.units * 2) / 2; // media unidad, que es lo que se puede leer

  return (
    <div className="mt-7 rounded-theme border-2 border-primary bg-primary-light/30 p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">Tu resultado</p>

      <p className="mt-3 text-lg font-semibold leading-relaxed text-ink">
        Para sacar <span className="text-primary-dark">{r.doseLabel}</span> de {r.productName},
        llena tu jeringa hasta la marca{' '}
        <span className="font-price text-2xl font-bold text-primary-dark">{rounded}</span>.
      </p>
      <p className="mt-1 text-sm text-muted">
        Vial de {r.variantLabel} + {r.waterMl} mL de agua · jeringa de {r.syringeUnits} unidades
      </p>

      {/* Jeringa a escala con la marca señalada */}
      <div className="mt-6">
        <div className="relative">
          <div className="relative h-11 overflow-hidden rounded-lg border-2 border-ink/25 bg-white">
            <div
              className="absolute inset-y-0 left-0 bg-primary/30 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
            <div className="pointer-events-none absolute inset-0 flex">
              {Array.from({ length: marks }).map((_, i) => (
                <span key={i} className="flex-1 border-r border-ink/15 last:border-r-0" />
              ))}
            </div>
            <div
              className="absolute inset-y-0 w-[3px] bg-primary-dark transition-all duration-300"
              style={{ left: `calc(${pct}% - 1.5px)` }}
            />
          </div>
          <div
            className="absolute -top-6 -translate-x-1/2 whitespace-nowrap rounded bg-primary-dark px-2 py-0.5 text-[11px] font-bold text-white transition-all duration-300"
            style={{ left: `${pct}%` }}
          >
            {rounded}
          </div>
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-muted">
          <span>0</span>
          <span>{r.syringeUnits / 2}</span>
          <span>{r.syringeUnits}</span>
        </div>
      </div>

      {r.overflows && (
        <p className="mt-4 rounded-theme border border-warn/30 bg-warn-bg px-3 py-2.5 text-xs font-medium text-warn">
          Esa cantidad no cabe en la jeringa de {r.syringeUnits} unidades. Usa una jeringa más
          grande, o agrega menos agua al vial para concentrar más la solución.
        </p>
      )}

      <p className="mt-5 rounded-theme bg-white px-4 py-3 text-sm text-ink">
        Con esta preparación, tu vial rinde{' '}
        <span className="font-bold text-primary-dark">{r.dosesPerVial}</span>{' '}
        {r.dosesPerVial === 1 ? 'extracción' : 'extracciones'} de {r.doseLabel}.
      </p>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer list-none text-xs font-semibold text-muted marker:content-none hover:text-ink">
          Ver los números técnicos ▾
        </summary>
        <dl className="mt-3 space-y-2 border-t border-primary/20 pt-3">
          <Row label="Concentración de la solución" value={`${r.concentration.toFixed(2)} mg/mL`} />
          <Row label="Cantidad en cada marca" value={`${r.mcgPerUnit.toFixed(1)} mcg`} />
          <Row label="Volumen exacto" value={`${r.volumeMl.toFixed(3)} mL`} />
          <Row label="Marca exacta (sin redondear)" value={`${r.units.toFixed(2)}`} />
        </dl>
      </details>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Cálculo aritmético únicamente. Nexa Labs no indica dosis ni protocolos — nuestros productos
        son exclusivamente para investigación.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-price text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
