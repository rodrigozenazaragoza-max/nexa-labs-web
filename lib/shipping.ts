import { siteConfig } from './site-config';

// Costo de envío del pedido.
//
// Regla única, usada TANTO en el navegador (para mostrar el resumen) como
// en el servidor (para cobrar de verdad). Vivir en un solo lugar evita que
// la pantalla diga una cosa y el cargo sea otra.
//
// Umbral y tarifa se configuran en lib/site-config.ts:
//   freeShippingThresholdMxn · policies.shippingCostMxn
//
// El umbral se evalúa sobre el subtotal de mercancía ANTES de aplicar
// cupones: si el carrito califica para envío gratis, un descuento no se lo
// quita. Es lo que el cliente ya vio prometido en la ficha de producto.
export function shippingCostFor(subtotalMxn: number): number {
  return subtotalMxn >= siteConfig.freeShippingThresholdMxn ? 0 : siteConfig.policies.shippingCostMxn;
}

export function qualifiesForFreeShipping(subtotalMxn: number): boolean {
  return subtotalMxn >= siteConfig.freeShippingThresholdMxn;
}

// Cuánto le falta al carrito para alcanzar el envío gratis (0 si ya calificó).
export function amountToFreeShipping(subtotalMxn: number): number {
  return Math.max(0, siteConfig.freeShippingThresholdMxn - subtotalMxn);
}
