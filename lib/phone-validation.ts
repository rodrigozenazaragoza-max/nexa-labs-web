// Validación real de teléfono por país — antes el campo aceptaba cualquier
// cantidad de dígitos. Usa libphonenumber-js (misma librería que usan
// WhatsApp/Stripe) para validar longitud y formato reales por país,
// incluyendo el código de área.
//
// Requiere: npm install libphonenumber-js

import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

// Mapea el selector de país que ya existe en el checkout ("52" / "1" / "0")
// a un código ISO que libphonenumber-js entiende.
const DIAL_CODE_TO_ISO: Record<string, CountryCode | undefined> = {
  '52': 'MX',
  '1': 'US',
};

export type PhoneCheck =
  | { valid: true; digitsOnly: string }
  | { valid: false; error: string };

export function checkPhone(rawDigits: string, dialCode: string): PhoneCheck {
  const digitsOnly = rawDigits.replace(/\D/g, '');

  if (!digitsOnly) {
    return { valid: false, error: 'El teléfono es obligatorio.' };
  }

  const iso = DIAL_CODE_TO_ISO[dialCode];

  // "Otro" (dialCode "0") no tiene un país fijo que validar — solo evitamos
  // números absurdamente cortos o largos.
  if (!iso) {
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { valid: false, error: 'Revisa el número, no parece un teléfono válido.' };
    }
    return { valid: true, digitsOnly };
  }

  const parsed = parsePhoneNumberFromString(digitsOnly, iso);
  if (!parsed || !parsed.isValid()) {
    const hint = iso === 'MX' ? 'Deben ser 10 dígitos (código de área + número local).' : 'Revisa el número.';
    return { valid: false, error: `Ese número no es válido para ${iso}. ${hint}` };
  }

  return { valid: true, digitsOnly };
}

// Largo máximo esperado por país — se usa para no dejar seguir escribiendo
// una vez alcanzado (evita que el cliente meta de más sin darse cuenta).
export function maxDigitsForDialCode(dialCode: string): number {
  if (dialCode === '52' || dialCode === '1') return 10;
  return 15;
}
