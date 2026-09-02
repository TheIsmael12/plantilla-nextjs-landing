/**
 * Las teselas de los mapas, en un solo sitio.
 *
 * Los tres mapas de la web —la sede en contacto, las zonas de cobertura de un servicio y el punto de una
 * ubicación— pintaban desde sitios distintos: dos desde CARTO y uno desde OpenStreetMap. Eso daba dos
 * problemas a la vez:
 *
 * - **CARTO pide clave.** Sus mapas base dejaron de ser libres para uso anónimo, así que las teselas
 *   empezaron a fallar sin que nada lo dijera: el mapa sale gris y en la consola queda un 401.
 * - **La CSP solo abría CARTO.** El mapa que ya tiraba de OpenStreetMap tenía sus teselas bloqueadas en
 *   producción, y solo en producción — la cabecera no se manda en desarrollo, así que en local se veía
 *   perfectamente y nadie lo notaba.
 *
 * Con un único origen, la CSP tiene una sola línea que mantener y no se puede volver a quedar corta al
 * añadir un mapa nuevo.
 */

/**
 * OpenStreetMap, sin clave y sin intermediario.
 *
 * Va al host único y **no** a los subdominios rotativos `{s}`: la política de uso de OpenStreetMap los da
 * por obsoletos desde que sirve por HTTP/2, donde repartir entre cuatro hosts ya no acelera nada y solo
 * multiplica las conexiones.
 */
export const MAP_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

/** Hasta dónde llega el detalle. OpenStreetMap sirve hasta 19; pedir más devuelve teselas en blanco. */
export const MAP_TILE_MAX_ZOOM = 19;

/**
 * La atribución, que **no es opcional**: la licencia de OpenStreetMap exige citar la fuente.
 *
 * Va como HTML porque es lo que espera el control de atribución de Leaflet.
 */
export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** El origen que la CSP tiene que dejar pasar en `img-src` para que las teselas se vean. */
export const MAP_TILES_ORIGIN = "https://tile.openstreetmap.org";
