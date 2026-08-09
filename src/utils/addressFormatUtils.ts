import type { ClientServiceAddress } from "@/types/client-portal/services";

/**
 * Compone una dirección de servicio en una sola línea de texto (`line1,
 * postalCode city`), lista para mostrar o para geocodificar en
 * `LocationMap`. Omite `line2`/`province`: son detalle interno (piso,
 * puerta...) que no ayuda a situar el punto en el mapa.
 * @param {ClientServiceAddress} [address] - Dirección del servicio, si tiene una asignada
 * @returns {string | undefined} La dirección en una línea, o `undefined` si no hay dirección
 */
export function formatServiceAddress(address: ClientServiceAddress | undefined): string | undefined {
  if (!address) return undefined;
  return [address.line1, `${address.postalCode} ${address.city}`.trim()].filter(Boolean).join(", ");
}
