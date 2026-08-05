// Estados de México con su abreviatura estándar (SEPOMEX), usados para el
// selector de "Estado" en el checkout y para el campo shipping_address.state
// que espera Ecart Pay.
export const MX_STATES: { name: string; code: string }[] = [
  { name: 'Aguascalientes', code: 'AGU' },
  { name: 'Baja California', code: 'BCN' },
  { name: 'Baja California Sur', code: 'BCS' },
  { name: 'Campeche', code: 'CAM' },
  { name: 'Chiapas', code: 'CHP' },
  { name: 'Chihuahua', code: 'CHH' },
  { name: 'Ciudad de México', code: 'CMX' },
  { name: 'Coahuila', code: 'COA' },
  { name: 'Colima', code: 'COL' },
  { name: 'Durango', code: 'DUR' },
  { name: 'Estado de México', code: 'MEX' },
  { name: 'Guanajuato', code: 'GUA' },
  { name: 'Guerrero', code: 'GRO' },
  { name: 'Hidalgo', code: 'HID' },
  { name: 'Jalisco', code: 'JAL' },
  { name: 'Michoacán', code: 'MIC' },
  { name: 'Morelos', code: 'MOR' },
  { name: 'Nayarit', code: 'NAY' },
  { name: 'Nuevo León', code: 'NLE' },
  { name: 'Oaxaca', code: 'OAX' },
  { name: 'Puebla', code: 'PUE' },
  { name: 'Querétaro', code: 'QUE' },
  { name: 'Quintana Roo', code: 'ROO' },
  { name: 'San Luis Potosí', code: 'SLP' },
  { name: 'Sinaloa', code: 'SIN' },
  { name: 'Sonora', code: 'SON' },
  { name: 'Tabasco', code: 'TAB' },
  { name: 'Tamaulipas', code: 'TAM' },
  { name: 'Tlaxcala', code: 'TLA' },
  { name: 'Veracruz', code: 'VER' },
  { name: 'Yucatán', code: 'YUC' },
  { name: 'Zacatecas', code: 'ZAC' },
];

// La API pública de códigos postales a veces regresa nombres viejos o con
// variaciones ("Distrito Federal" en vez de "Ciudad de México", "Coahuila de
// Zaragoza", etc.) — este mapa normaliza esos casos a nuestra lista.
const ALIASES: Record<string, string> = {
  'distrito federal': 'Ciudad de México',
  'coahuila de zaragoza': 'Coahuila',
  'michoacan de ocampo': 'Michoacán',
  'michoacán de ocampo': 'Michoacán',
  'veracruz de ignacio de la llave': 'Veracruz',
  'mexico': 'Estado de México',
  'méxico': 'Estado de México',
};

export function findMxStateByName(name: string | undefined | null) {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();
  const aliased = ALIASES[normalized] || name.trim();
  return MX_STATES.find((s) => s.name.toLowerCase() === aliased.toLowerCase()) || null;
}
