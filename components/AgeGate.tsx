'use client';

import { useEffect, useState } from 'react';
import { AGE_GATE_STORAGE_KEY, AGE_GATE_EVENT } from '@/lib/gate';

// Gate de edad + uso de investigación. Se muestra una vez por navegador
// (se guarda en localStorage) antes de dejar ver el catálogo.
// No lo quites ni lo debilites: es la pieza de compliance más importante
// del sitio frente a FDA/PROFECO — confirma explícitamente que el
// visitante entiende que esto NO es para consumo humano.

export default function AgeGate() {
  const [visible, setVisible] = useState(false);
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(AGE_GATE_STORAGE_KEY)) setVisible(true);
  }, []);

  function enter() {
    localStorage.setItem(AGE_GATE_STORAGE_KEY, '1');
    setVisible(false);
    // Avisa a otros componentes (ej. NewsletterModal) que ya se puede
    // mostrar contenido encima del sitio — nunca antes de esto.
    window.dispatchEvent(new Event(AGE_GATE_EVENT));
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-5">
      <div className="max-w-md rounded-2xl border border-border bg-panel p-8">
        <h2 className="mb-3 text-lg font-semibold">Antes de continuar</h2>
        <p className="mb-4 text-sm text-muted">
          Vendemos péptidos de investigación (RUO). No son medicamentos, suplementos
          ni productos de consumo humano. No están destinados a diagnóstico,
          tratamiento ni prevención de ninguna condición.
        </p>
        <label className="mb-3 flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" className="mt-1" checked={c1} onChange={(e) => setC1(e.target.checked)} />
          Soy mayor de 18 años.
        </label>
        <label className="mb-5 flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" className="mt-1" checked={c2} onChange={(e) => setC2(e.target.checked)} />
          Entiendo que estos productos son exclusivamente para investigación
          científica y no para consumo humano.
        </label>
        <button
          disabled={!(c1 && c2)}
          onClick={enter}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-ink disabled:opacity-40"
        >
          Entrar al sitio
        </button>
      </div>
    </div>
  );
}
