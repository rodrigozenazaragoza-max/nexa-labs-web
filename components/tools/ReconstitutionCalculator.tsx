'use client';

import { useMemo, useState } from 'react';
import { Syringe, Droplets, Target, RotateCcw } from 'lucide-react';

// Calculadora de reconstitución — convierte una dosis objetivo en unidades
// de jeringa de insulina. TODA la matemática vive aquí en el cliente: no
// hay llamadas a servidor, funciona instantáneo y sin registro.
//
// Fórmulas (escala U-100: 1 mL = 100 unidades, 1 unidad = 0.01 mL):
//   concentración (mg/mL) = mg del vial ÷ mL de agua
//   unidades a extraer    = (mcg objetivo ÷ (mg vial × 1000)) × mL agua × 100
//   dosis por vial        = (mg vial × 1000) ÷ mcg objetivo  (redondeado abajo)
//
// Nota RUO: esto es aritmética, no un protocolo. No sugerimos dosis.

const VIAL_PRESETS = [2, 5, 10, 15];
const WATER_PRESETS = [1, 2, 3, 5];
const DOSE_PRESETS_MCG = [100, 250, 500, 1000];

// Jeringas de insulina: todas usan la misma escala U-100, solo cambia el
// tamaño del barril (y por lo tanto qué tan separadas se ven las rayitas).
const SYRINGES = [
  { ml: 1, label: '1 mL', units: 100 },
  { ml: 0.5, label: '0.5 mL', units: 50 },
  { ml: 0.3, label: '0.3 mL', units: 30 },
];

export default function ReconstitutionCalculator() {
  const [vialMg, setVialMg] = useState<string>('5');
  const [waterMl, setWaterMl] = useState<string>('2');
  const [dose, setDose] = useState<string>('250');
  const [doseUnit, setDoseUnit] = useState<'mcg' | 'mg'>('mcg');
  const [syringeMl, setSyringeMl] = useState<number>(1);

  const result = useMemo(() => {
    const mg = parseFloat(vialMg);
    const ml = parseFloat(waterMl);
    const d = parseFloat(dose);
    if (!mg || !ml || !d || mg <= 0 || ml <= 0 || d <= 0) return null;

    const doseMcg = doseUnit === 'mg' ? d * 1000 : d;
    const totalMcg = mg * 1000;
    const concentrationMgMl = mg / ml;
    const units = (doseMcg / totalMcg) * ml * 100;
    const volumeMl = units / 100;
    const dosesPerVial = Math.floor(totalMcg / doseMcg);
    const mcgPerUnit = totalMcg / (ml * 100);
    const syringe = SYRINGES.find((s) => s.ml === syringeMl) ?? SYRINGES[0];
    const overflows = units > syringe.units;

    return { concentrationMgMl, units, volumeMl, dosesPerVial, mcgPerUnit, overflows, syringe };
  }, [vialMg, waterMl, dose, doseUnit, syringeMl]);

  function reset() {
    setVialMg('5');
    setWaterMl('2');
    setDose('250');
    setDoseUnit('mcg');
    setSyringeMl(1);
  }

  // Posición del émbolo en el dibujo de la jeringa (0–100%).
  const fillPct = result ? Math.min(100, (result.units / result.syringe.units) * 100) : 0;

  return (
    <div className="rounded-theme border border-border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1fr]">
        {/* ---------- Entradas ---------- */}
        <div className="space-y-5">
          <Field
            icon={<Droplets size={15} />}
            label="1. Péptido en el vial"
            unit="mg"
            value={vialMg}
            onChange={setVialMg}
            presets={VIAL_PRESETS}
            onPreset={(v) => setVialMg(String(v))}
          />

          <Field
            icon={<Droplets size={15} />}
            label="2. Agua bacteriostática que agregas"
            unit="mL"
            value={waterMl}
            onChange={setWaterMl}
            presets={WATER_PRESETS}
            onPreset={(v) => setWaterMl(String(v))}
          />

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
              <Target size={15} className="text-primary" /> 3. Dosis objetivo
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="w-full rounded-theme border border-border px-3 py-2.5 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
              />
              <div className="flex shrink-0 overflow-hidden rounded-theme border border-border">
                {(['mcg', 'mg'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setDoseUnit(u)}
                    className={`px-3 text-xs font-bold transition ${
                      doseUnit === u ? 'bg-ink text-white' : 'bg-white text-muted hover:text-ink'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {doseUnit === 'mcg' && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DOSE_PRESETS_MCG.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDose(String(p))}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:border-primary hover:text-primary"
                  >
                    {p} mcg
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
              <Syringe size={15} className="text-primary" /> 4. Tamaño de jeringa
            </label>
            <div className="flex gap-2">
              {SYRINGES.map((s) => (
                <button
                  key={s.ml}
                  type="button"
                  onClick={() => setSyringeMl(s.ml)}
                  className={`flex-1 rounded-theme border px-3 py-2.5 text-sm font-semibold transition ${
                    syringeMl === s.ml ? 'border-ink bg-ink text-white' : 'border-border text-ink hover:border-ink'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Las tres usan la misma escala U-100 — las unidades a extraer son idénticas. Un barril
              más chico solo separa más las rayitas, lo que hace más fácil leer dosis pequeñas.
              ¿No estás seguro? Deja 1 mL.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-ink"
          >
            <RotateCcw size={13} /> Reiniciar valores
          </button>
        </div>

        {/* ---------- Resultado ---------- */}
        <div className="rounded-theme bg-surface p-5">
          {!result ? (
            <p className="py-12 text-center text-sm text-muted">
              Completa los cuatro campos para ver tu resultado.
            </p>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Extrae en tu jeringa</p>
              <p className="mt-1 font-price text-4xl font-bold leading-none text-ink">
                {result.units.toFixed(1)}
                <span className="ml-1.5 text-base font-semibold text-muted">unidades</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                equivale a {result.volumeMl.toFixed(3)} mL en la jeringa de {result.syringe.label}
              </p>

              {/* Jeringa dibujada — muestra hasta dónde jalar el émbolo */}
              <div className="mt-5">
                <div className="relative h-9 overflow-hidden rounded-full border-2 border-border bg-white">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/25 transition-all duration-300"
                    style={{ width: `${fillPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 w-1 bg-primary transition-all duration-300"
                    style={{ left: `calc(${fillPct}% - 2px)` }}
                  />
                  <div className="pointer-events-none absolute inset-0 flex">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i} className="flex-1 border-r border-border/60 last:border-r-0" />
                    ))}
                  </div>
                </div>
                <div className="mt-1 flex justify-between text-[10px] font-semibold text-muted">
                  <span>0</span>
                  <span>{result.syringe.units / 2}</span>
                  <span>{result.syringe.units} u</span>
                </div>
              </div>

              {result.overflows && (
                <p className="mt-3 rounded-theme border border-warn/30 bg-warn-bg px-3 py-2 text-[11px] font-medium text-warn">
                  Esa dosis excede la capacidad de la jeringa de {result.syringe.label}. Usa una
                  jeringa más grande, o agrega menos agua para concentrar más la solución.
                </p>
              )}

              <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
                <Row label="Concentración" value={`${result.concentrationMgMl.toFixed(2)} mg/mL`} />
                <Row label="Por cada unidad" value={`${result.mcgPerUnit.toFixed(1)} mcg`} />
                <Row label="Dosis por vial" value={`${result.dosesPerVial}`} />
              </dl>

              <p className="mt-4 text-[11px] leading-relaxed text-muted">
                Cálculo aritmético únicamente. Nexa Labs no indica dosis ni protocolos —
                nuestros productos son exclusivamente para investigación.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  unit,
  value,
  onChange,
  presets,
  onPreset,
}: {
  icon: React.ReactNode;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  presets: number[];
  onPreset: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
        <span className="text-primary">{icon}</span> {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-theme border border-border px-3 py-2.5 pr-12 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">{unit}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPreset(p)}
            className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:border-primary hover:text-primary"
          >
            {p} {unit}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-price font-semibold text-ink">{value}</dd>
    </div>
  );
}
