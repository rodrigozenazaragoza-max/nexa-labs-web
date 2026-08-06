'use client';

import { useState } from 'react';
import { FileText, Table2, FlaskConical, TestTube2, HelpCircle } from 'lucide-react';
import MolecularCard from './MolecularCard';
import type { Product } from '@/lib/types';

// Tabs de detalle de producto (Overview / Properties / Research / Lab Results / FAQ),
// patrón inspirado en tiendas de research chemicals — cada tab lee su contenido
// directamente de los campos del producto en Supabase, así que para editar el
// contenido de un producto no se toca este componente, solo la fila en la tabla.

type Tab = 'overview' | 'properties' | 'research' | 'lab' | 'faq';

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'properties', label: 'Properties', icon: Table2 },
  { id: 'research', label: 'Research', icon: FlaskConical },
  { id: 'lab', label: 'Lab Results', icon: TestTube2 },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

export default function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<Tab>('overview');

  return (
    <section className="mx-auto max-w-6xl px-6 pb-14 pt-4">
      {/* Las 5 tabs se reparten el ancho completo del contenedor (grid de 5
          columnas iguales) para que la barra no quede con un hueco vacío a
          la derecha. En móvil se acomodan en dos filas. */}
      <div className="grid grid-cols-2 gap-2 rounded-theme border border-border bg-surface p-2 sm:grid-cols-3 lg:grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-theme px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {active === 'overview' && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_300px]">
            <div className="space-y-4 text-sm leading-relaxed text-muted">
              {product.long_description ? (
                <p>{product.long_description}</p>
              ) : (
                <p className="italic">
                  Agrega una descripción de investigación en la columna <code>long_description</code>
                  del producto en Supabase. Mantén el enfoque en hallazgos/mecanismos de
                  investigación — sin instrucciones de dosis ni lenguaje de beneficio para humanos.
                </p>
              )}
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">✔ Pureza {product.purity}</li>
                <li className="flex items-center gap-2">✔ Verificado por laboratorio independiente</li>
                <li className="flex items-center gap-2">✔ Grado investigación</li>
                <li className="flex items-center gap-2">✔ Exclusivo para uso en investigación de laboratorio</li>
              </ul>
            </div>
            <MolecularCard product={product} />
          </div>
        )}

        {active === 'properties' && (
          <div className="max-w-2xl overflow-hidden rounded-theme border border-border">
            {product.properties && product.properties.length > 0 ? (
              product.properties.map((prop, i) => (
                <div
                  key={prop.label}
                  className={`flex justify-between px-5 py-3 text-sm ${i % 2 === 0 ? 'bg-surface' : 'bg-white'}`}
                >
                  <span className="text-muted">{prop.label}</span>
                  <span className="font-medium text-ink">{prop.value}</span>
                </div>
              ))
            ) : (
              <p className="p-5 text-sm italic text-muted">
                Agrega propiedades (fórmula, peso molecular, secuencia, CAS, etc.) en la
                columna <code>properties</code> (JSON) del producto.
              </p>
            )}
          </div>
        )}

        {active === 'research' && (
          <div className="max-w-3xl text-sm leading-relaxed text-muted">
            {product.research_notes ? (
              <p>{product.research_notes}</p>
            ) : (
              <p className="italic">
                Agrega notas de investigación en la columna <code>research_notes</code>.
              </p>
            )}
          </div>
        )}

        {active === 'lab' && (
          <div className="max-w-md space-y-4 text-sm">
            <div className="flex justify-between border-b border-dashed border-border py-2">
              <span className="text-muted">Pureza (HPLC)</span>
              <span className="font-medium">{product.purity}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-border py-2">
              <span className="text-muted">Identidad</span>
              <span className="font-medium">Espectrometría de masas</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-border py-2">
              <span className="text-muted">Metales pesados</span>
              <span className="font-medium">ICP-MS</span>
            </div>
            {product.coa_url ? (
              <a href={product.coa_url} className="inline-block font-semibold text-primary">
                Descargar Certificado de Análisis (COA) →
              </a>
            ) : (
              <p className="italic text-muted">
                Sube el COA a Supabase Storage y enlázalo en la columna <code>coa_url</code>.
              </p>
            )}
          </div>
        )}

        {active === 'faq' && (
          <div className="max-w-2xl space-y-4">
            {product.faq && product.faq.length > 0 ? (
              product.faq.map((item) => (
                <div key={item.question} className="rounded-theme border border-border p-4">
                  <p className="text-sm font-semibold text-ink">{item.question}</p>
                  <p className="mt-1 text-sm text-muted">{item.answer}</p>
                </div>
              ))
            ) : (
              <p className="text-sm italic text-muted">
                Agrega preguntas frecuentes en la columna <code>faq</code> (JSON) del producto.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
