import L from 'leaflet';

import { MAP_ATTRIBUTION, MAP_TILE_OPTIONS, MAP_TILE_URL } from '@/config/mapTiles';

/*
 * Leaflet reparte z-index del 200 al 1000 entre sus capas y controles, por encima de la cabecera (30) y del
 * mega-menú (50). Esta hoja lo encierra en su propio contexto de apilamiento, y se importa aquí para que
 * cualquier mapa la reciba: estaba resuelto solo en el de zonas y los otros dos salían tapando la barra.
 */
import '@/styles/04-components/ui/maps/leaflet-stacking.scss';

/**
 * Monta el mapa base sobre un mapa de Leaflet.
 *
 * Va aquí y no repetido en cada mapa porque los tres tienen que pintar **el mismo fondo**: cuando cada uno
 * montaba su capa por su cuenta acabaron con proveedores distintos, y uno de ellos con las teselas
 * bloqueadas por la CSP en producción sin que nadie lo notara.
 *
 * La atribución se garantiza aquí y no se deja a lo que declare cada mapa: uno de los tres arrancaba con
 * `attributionControl: false` y se quedó sin citar la fuente, que es un requisito de la licencia y no una
 * decisión de estilo. El prefijo («Leaflet») sí se quita: no es una fuente de datos, es la biblioteca.
 * @param {L.Map} map - El mapa de Leaflet al que se le añade el fondo
 * @returns {void} No devuelve nada: la capa queda añadida al mapa
 */
export function addMapBaseLayer(map: L.Map): void {
  L.tileLayer(MAP_TILE_URL, { ...MAP_TILE_OPTIONS, attribution: MAP_ATTRIBUTION }).addTo(map);

  if (!map.attributionControl) L.control.attribution().addTo(map);

  map.attributionControl.setPrefix(false);
}
