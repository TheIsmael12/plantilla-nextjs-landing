/**
 * Coordenadas de una dirección escrita (`GET /geocoding`). `found: false` no
 * es un error: una dirección incompleta o mal escrita simplemente no se
 * puede situar, y lo único que toca hacer es no pintar el mapa.
 * @interface GeocodedAddress
 * @property {boolean} found - El servicio ha sabido situar la dirección
 * @property {number} [latitude] - Latitud en grados decimales
 * @property {number} [longitude] - Longitud en grados decimales
 * @property {string} [displayName] - Dirección normalizada tal como la entendió el servicio
 */
export interface GeocodedAddress {
  found: boolean;
  latitude?: number;
  longitude?: number;
  displayName?: string;
}
