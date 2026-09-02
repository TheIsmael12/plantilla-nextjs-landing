/**
 * Las teselas de los mapas, en un solo sitio.
 *
 * Los tres mapas —la sede en contacto, las zonas de cobertura de un servicio y el punto de una ubicación—
 * las pedían cada uno por su cuenta, con la URL escrita a mano. Eso dio el fallo que de verdad importaba:
 * **la CSP solo abría un proveedor**, así que el mapa que pedía las suyas a otro las tenía bloqueadas en
 * producción — y solo en producción, porque esa cabecera no se manda en desarrollo, de modo que en local se
 * veía bien y no había forma de enterarse. Con un único origen, la cabecera tiene una sola línea que
 * mantener y no puede volver a quedarse corta.
 *
 * ## Qué se probó antes de quedarse con este
 *
 * - **CARTO** («Voyager») era lo que había, pero ha empezado a pedir clave: en el navegador devuelve «API
 *   key required». Un `curl` sí recibe la tesela, lo que hace el fallo especialmente incómodo — desde
 *   consola parece funcionar y en pantalla no.
 * - **Las estándar de OpenStreetMap** no piden clave, pero llevan comercios, iconos y nombres de negocios.
 * - **Vectorial** (MapLibre sobre OpenFreeMap) habría permitido quitar las capas de comercios y quedarse
 *   con el color. Se intentó y **no llegó a pintar**: estilo, sprite y fuentes cargan con un 200 y de las
 *   teselas vectoriales no sale nada, ni sirviendo el worker desde `public/`. Descartado.
 * - **El lienzo gris de Esri** es limpio pero apagado, y su malla de carreteras blancas cruzando el mapa
 *   distrae más de lo que sitúa.
 * - **Su relieve sin carreteras** no tiene datos al zoom al que se usan estos mapas: devuelve teselas con
 *   «Map data not yet available».
 *
 * Se queda el **topográfico**: color contenido, relieve, y las carreteras presentes pero discretas, que es
 * lo que se busca en un fondo cuyo trabajo es situar un pin sin competir con él.
 */

/**
 * El topográfico de Esri. No pide clave — comprobado con `Origin` y `Referer` del sitio.
 *
 * Es un servicio de ArcGIS, así que el orden de la ruta es `{z}/{y}/{x}` y **no** `{z}/{x}/{y}`: invertirlo
 * devuelve teselas de otro sitio del mundo, o nada, según el zoom.
 *
 * Trae **sus propios nombres** de calle y de municipio, así que no hace falta una capa de etiquetas encima
 * —como sí la necesitaba el lienzo gris, que viene sin ninguna—.
 */
export const MAP_TILE_URL =
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

/** Hasta dónde se deja acercar. Comprobado que sirve hasta 19. */
export const MAP_TILE_MAX_ZOOM = 19;

/**
 * La atribución, que **no es opcional**: son las fuentes de los datos y las condiciones del servicio
 * exigen citarlas. Va como HTML porque es lo que espera el control de atribución de Leaflet.
 */
export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Las opciones de la capa, tal cual las espera `L.tileLayer`. */
export const MAP_TILE_OPTIONS = { maxZoom: MAP_TILE_MAX_ZOOM } as const;

/** El origen que la CSP tiene que dejar pasar en `img-src` para que las teselas se vean. */
export const MAP_TILES_ORIGIN = "https://services.arcgisonline.com";
