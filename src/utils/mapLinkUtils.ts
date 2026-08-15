import { parseUserAgent } from '@/utils/userAgentUtils';

/**
 * Construye el enlace "abrir en Maps" según el sistema operativo del visitante: Apple Maps en
 * iOS/macOS (donde es la app nativa, y el enlace la abre directamente en vez de ofrecer
 * instalar Google Maps), Google Maps en cualquier otro caso (Android y escritorio) — funciona
 * sin necesidad de tener la app instalada, a diferencia de un enlace `waze://` que fallaría
 * silenciosamente si el visitante no tiene Waze.
 *
 * Compartida entre `ContactMapSection.tsx` y `SupportInfo.tsx`: ambas muestran la misma sede,
 * con el mismo botón "ver en Maps".
 * @param {number} latitude - Latitud del punto
 * @param {number} longitude - Longitud del punto
 * @param {string} label - Nombre a mostrar como pin en el mapa de destino
 * @returns {string} La URL que abre la ubicación en la app de mapas del dispositivo
 */
export function buildMapsHref(latitude: number, longitude: number, label: string): string {
  const { os } = parseUserAgent(typeof navigator === 'undefined' ? undefined : navigator.userAgent);

  if (os === 'iOS' || os === 'macOS') {
    return `https://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(label)}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/**
 * Enlace neutro para el primer render/hidratación: en servidor no hay `navigator`, así que no
 * se puede saber el sistema operativo real todavía — Google Maps web abre en cualquier
 * dispositivo aunque no sea la app nativa, y evita un desajuste de HTML entre servidor y
 * cliente. Se sustituye por {@link buildMapsHref} en cuanto el componente se monta.
 * @param {number} latitude - Latitud del punto
 * @param {number} longitude - Longitud del punto
 * @returns {string} La URL neutra (Google Maps web) para el render inicial
 */
export function buildFallbackMapsHref(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
