import { parseUserAgent } from '@/utils/userAgentUtils';

/** Un punto del mapa, cuando se conoce. */
interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Construye el enlace "abrir en Maps" según el sistema operativo del visitante: Apple Maps en
 * iOS/macOS (donde es la app nativa, y el enlace la abre directamente en vez de ofrecer
 * instalar Google Maps), Google Maps en cualquier otro caso (Android y escritorio) — funciona
 * sin necesidad de tener la app instalada, a diferencia de un enlace `waze://` que fallaría
 * silenciosamente si el visitante no tiene Waze.
 *
 * **La dirección es obligatoria y las coordenadas no.** Es el orden correcto de las dos cosas: la
 * dirección es el dato que se mantiene, y las coordenadas son una precisión opcional que puede no estar
 * configurada. Sin ellas el enlace busca la dirección escrita, que es lo que hace cualquiera a mano y lo
 * que acierta; con ellas se abre directamente sobre el punto, sin depender de que el buscador del mapa
 * interprete bien la calle.
 *
 * Compartida entre `ContactMapSection.tsx` y `SupportInfo.tsx`: ambas muestran la misma sede,
 * con el mismo botón "ver en Maps".
 * @param {string} address - Dirección completa de la sede
 * @param {Coordinates} [coordinates] - Coordenadas, si están configuradas
 * @returns {string} La URL que abre la ubicación en la app de mapas del dispositivo
 */
export function buildMapsHref(address: string, coordinates?: Coordinates | null): string {
  const { os } = parseUserAgent(typeof navigator === 'undefined' ? undefined : navigator.userAgent);

  if (os === 'iOS' || os === 'macOS') {
    // Con `ll` y `q` juntos, Apple Maps deja el pin en el punto y usa `q` como su etiqueta.
    return coordinates
      ? `https://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&q=${encodeURIComponent(address)}`
      : `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  }

  return coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Enlace neutro para el primer render/hidratación: en servidor no hay `navigator`, así que no
 * se puede saber el sistema operativo real todavía — Google Maps web abre en cualquier
 * dispositivo aunque no sea la app nativa, y evita un desajuste de HTML entre servidor y
 * cliente. Se sustituye por {@link buildMapsHref} en cuanto el componente se monta.
 * @param {string} address - Dirección completa de la sede
 * @param {Coordinates} [coordinates] - Coordenadas, si están configuradas
 * @returns {string} La URL neutra (Google Maps web) para el render inicial
 */
export function buildFallbackMapsHref(address: string, coordinates?: Coordinates | null): string {
  return coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
