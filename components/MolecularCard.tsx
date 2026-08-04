import type { Product } from '@/lib/types';

// Card "Estructura Molecular" — vive junto a la descripción en el tab
// Overview de producto. No es un visor 3D interactivo (no tenemos datos de
// coordenadas 3D reales de cada péptido); en su lugar es un recuadro sólido
// con la fórmula química, peso molar y CAS que ya vienen en la columna
// `properties` de cada producto, más una ilustración decorativa propia
// (nodos conectados) en los colores de marca de Nexa Labs — no es una copia
// del visor de SwissChems, es nuestra propia versión más simple.
function findProp(product: Product, label: string): string | null {
  const match = product.properties?.find((p) => p.label === label);
  return match?.value ?? null;
}

// Convierte "C194H312N54O59S2" en segmentos [{text:'C194', sub:true}, ...]
// para poder renderizar los números como subíndice real.
function formulaParts(formula: string): { text: string; sub: boolean }[] {
  const parts: { text: string; sub: boolean }[] = [];
  const regex = /([A-Za-z+\-]+)|(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(formula))) {
    if (m[1]) parts.push({ text: m[1], sub: false });
    else if (m[2]) parts.push({ text: m[2], sub: true });
  }
  return parts;
}

export default function MolecularCard({ product }: { product: Product }) {
  const formula = findProp(product, 'Fórmula Química');
  const weight = findProp(product, 'Peso Molar');
  const cas = findProp(product, 'Número CAS');
  const cid = findProp(product, 'PubChem CID');

  if (!formula) return null;
  // Fórmulas reales de químicos son una sola palabra tipo "C194H312N54O59S2".
  // Si trae espacios o texto (ej. "No aplica..." en proteínas recombinantes
  // grandes como Follistatin 344) se muestra tal cual, sin subíndices.
  const isRealFormula = /^[A-Za-z0-9+\-]+$/.test(formula);

  return (
    <div className="overflow-hidden rounded-theme border-2 border-primary/15 bg-white shadow-sm">
      <div className="border-b border-primary/15 bg-primary-light px-5 py-3.5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">Estructura Molecular</p>
        <p className="mt-1 font-price text-lg text-ink">
          {isRealFormula
            ? formulaParts(formula).map((part, i) =>
                part.sub ? <sub key={i}>{part.text}</sub> : <span key={i}>{part.text}</span>
              )
            : formula}
        </p>
      </div>

      {/* Ilustración decorativa — nodos y enlaces en los colores de marca,
          en vez de una molécula 3D rotable real. */}
      <div className="flex justify-center bg-surface py-6">
        <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.5">
            <line x1="30" y1="20" x2="70" y2="45" />
            <line x1="70" y1="45" x2="115" y2="25" />
            <line x1="70" y1="45" x2="55" y2="85" />
            <line x1="55" y1="85" x2="100" y2="95" />
            <line x1="70" y1="45" x2="110" y2="70" />
          </g>
          <circle cx="30" cy="20" r="7" fill="var(--color-primary)" />
          <circle cx="70" cy="45" r="9" fill="var(--color-primary-dark)" />
          <circle cx="115" cy="25" r="6" fill="var(--color-primary)" opacity="0.7" />
          <circle cx="55" cy="85" r="6" fill="var(--color-primary)" opacity="0.7" />
          <circle cx="100" cy="95" r="5" fill="var(--color-primary)" opacity="0.5" />
          <circle cx="110" cy="70" r="5" fill="var(--color-primary)" opacity="0.5" />
        </svg>
      </div>

      <div className="divide-y divide-border">
        {weight && (
          <div className="flex justify-between px-5 py-2.5 text-xs">
            <span className="text-muted">Peso Molar</span>
            <span className="font-semibold text-ink">{weight}</span>
          </div>
        )}
        {cas && (
          <div className="flex justify-between px-5 py-2.5 text-xs">
            <span className="text-muted">Número CAS</span>
            <span className="font-semibold text-ink">{cas}</span>
          </div>
        )}
        {cid && (
          <div className="flex justify-between px-5 py-2.5 text-xs">
            <span className="text-muted">PubChem CID</span>
            <span className="font-semibold text-ink">{cid}</span>
          </div>
        )}
      </div>
    </div>
  );
}
