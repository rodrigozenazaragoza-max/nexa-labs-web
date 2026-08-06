// Logos de métodos de pago dibujados con SVG/CSS a los colores reales de
// cada marca (no imágenes externas, no dependemos de assets de terceros).
// Se usan en la página de producto y se pueden reutilizar en checkout.
// OXXO ya no se acepta — no aparece en esta lista.
export default function PaymentLogos() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Visa */}
      <span className="flex h-8 w-14 items-center justify-center rounded border border-border bg-white px-1.5">
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Visa">
          <text x="0" y="13" fontFamily="Arial, sans-serif" fontStyle="italic" fontWeight="900" fontSize="15" fill="#1A1F71">
            VISA
          </text>
        </svg>
      </span>

      {/* Mastercard */}
      <span className="flex h-8 w-14 items-center justify-center rounded border border-border bg-white px-1.5">
        <svg viewBox="0 0 36 22" className="h-5 w-auto">
          <circle cx="14" cy="11" r="10" fill="#EB001B" />
          <circle cx="22" cy="11" r="10" fill="#F79E1B" />
          <path
            d="M18 3.4a10 10 0 0 1 0 15.2 10 10 0 0 1 0-15.2Z"
            fill="#FF5F00"
          />
        </svg>
      </span>

      {/* American Express */}
      <span className="flex h-8 w-14 items-center justify-center rounded bg-[#2E77BC] px-1.5">
        <svg viewBox="0 0 48 16" className="h-3.5 w-auto">
          <text x="0" y="12" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="10" fill="#ffffff" letterSpacing="0.5">
            AMEX
          </text>
        </svg>
      </span>

      {/* SPEI — Sistema de Pagos Electrónicos Interbancarios (Banco de México) */}
      <span className="flex h-8 items-center justify-center rounded border border-border bg-white px-2">
        <svg viewBox="0 0 60 16" className="h-3.5 w-auto">
          <text x="0" y="12" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="12" fill="#004990" letterSpacing="0.5">
            SPEI
          </text>
        </svg>
      </span>

      {/* Transferencia bancaria */}
      <span className="flex h-8 items-center justify-center rounded border border-border bg-white px-2.5 text-[10px] font-bold tracking-wide text-muted">
        TRANSFERENCIA
      </span>
    </div>
  );
}
