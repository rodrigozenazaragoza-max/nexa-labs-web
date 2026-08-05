// Formatea números como moneda MXN con separador de miles: 1329.5 -> "1,329.50"
// Se usa junto con el símbolo "$" y el sufijo "MXN" ya presentes en cada
// componente, para no cambiar el estilo de precios ya establecido.
export function formatMxn(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
