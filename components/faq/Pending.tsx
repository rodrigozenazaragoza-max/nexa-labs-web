import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

// Nota visible para Rod (no un dato oficial de Nexa Labs): marca las
// respuestas de FAQ que vinieron de un borrador (SwissChems/plantilla) y
// todavía necesitan el dato real de Nexa Labs antes de darse por buenas.
// Vive en código (app/faq/page.tsx), no en Supabase — para editarla hay
// que pedir el cambio o tocar el archivo directamente.
export default function Pending({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-theme border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-600" />
      <p>
        <span className="font-semibold">Pendiente de confirmar:</span> {children}
      </p>
    </div>
  );
}
