// Etiqueta roja "OFERTA" — se muestra en la esquina superior derecha de
// la foto de un producto cuando su columna on_sale está en true en
// Supabase. Distinta del rojo de las advertencias RUO, a propósito.
export default function SaleBadge() {
  return (
    <span className="absolute right-2 top-2 z-10 rounded-full bg-sale px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
      Oferta
    </span>
  );
}
