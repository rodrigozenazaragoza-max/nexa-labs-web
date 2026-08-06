/* eslint-disable @next/next/no-img-element */

// Logos OFICIALES de métodos de pago — archivos reales del paquete
// payment-icons (Visa, Mastercard, Amex con sus colores de marca) más el
// logo de SPEI, todos en public/payment/. Si algún día quieres reemplazar
// alguno por otra versión oficial, solo sobreescribe el .svg en esa
// carpeta — este componente no cambia.
const LOGOS = [
  { src: '/payment/visa.svg', alt: 'Visa' },
  { src: '/payment/mastercard.svg', alt: 'Mastercard' },
  { src: '/payment/amex.svg', alt: 'American Express' },
  { src: '/payment/spei.svg', alt: 'SPEI' },
];

export default function PaymentLogos() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {LOGOS.map((logo) => (
        <img
          key={logo.alt}
          src={logo.src}
          alt={logo.alt}
          className="h-8 w-auto rounded border border-border"
        />
      ))}
      <span className="flex h-8 items-center justify-center rounded border border-border bg-white px-2.5 text-[10px] font-bold tracking-wide text-muted">
        TRANSFERENCIA
      </span>
    </div>
  );
}
