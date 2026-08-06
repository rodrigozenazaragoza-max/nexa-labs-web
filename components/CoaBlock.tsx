import { ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';

// Bloque "Ver Certificado de Análisis (COA)" — vive justo debajo del
// selector de dosis en la página de producto.
//
// Se muestra SIEMPRE, tenga o no PDF cargado:
//  · con coa_url  → enlace directo que abre el certificado.
//  · sin coa_url  → el bloque sigue visible y ofrece pedirlo por WhatsApp,
//    para que la promesa de "COA por lote" nunca desaparezca de la ficha
//    solo porque falta subir un archivo. Para activar el enlace directo,
//    sube el PDF y guarda su URL en la columna `coa_url` del producto.
export default function CoaBlock({
  coaUrl,
  purity,
  productName,
  lot,
  whatsappNumber,
}: {
  coaUrl: string | null;
  purity: string;
  productName?: string;
  lot?: string | null;
  whatsappNumber?: string;
}) {
  const shell =
    'flex items-center justify-between gap-3 rounded-theme border border-border bg-surface px-4 py-3.5 transition hover:border-primary';

  const icon = (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
      <ShieldCheck size={16} />
    </span>
  );

  if (coaUrl) {
    return (
      <a href={coaUrl} target="_blank" rel="noopener noreferrer" className={shell}>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-sm font-semibold text-ink">Ver Certificado de Análisis (COA)</p>
            <p className="text-xs text-muted">
              {purity} de pureza por HPLC · {lot ? `Lote ${lot}` : 'verificable por lote'}
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
          Abrir <ArrowRight size={13} />
        </span>
      </a>
    );
  }

  const waUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hola, me gustaría ver el Certificado de Análisis (COA) de ${productName ?? 'este producto'}. ¿Me lo comparten?`
      )}`
    : null;

  const content = (
    <>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-semibold text-ink">Certificado de Análisis (COA) por lote</p>
          <p className="text-xs text-muted">
            {purity} de pureza por HPLC · solicítalo y te lo compartimos
          </p>
        </div>
      </div>
      {waUrl && (
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
          Pedirlo <MessageCircle size={13} />
        </span>
      )}
    </>
  );

  return waUrl ? (
    <a href={waUrl} target="_blank" rel="noopener noreferrer" className={shell}>
      {content}
    </a>
  ) : (
    <div className={shell}>{content}</div>
  );
}
