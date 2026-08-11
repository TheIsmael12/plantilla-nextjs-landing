/**
 * De dónde saca un gráfico sus colores (§10 requisitos.md).
 *
 * **De `00-settings/_colors.scss` y de ningún otro sitio.** Aquí no hay ni un color escrito: lo que
 * hay es la lista de variables CSS que se leen del documento al montar el gráfico. Así el panel usa
 * los mismos tokens que el resto de la aplicación, el tema oscuro se resuelve solo —la cascada ya
 * cambia los valores dentro de `.dark`— y cambiar la marca no obliga a tocar TypeScript.
 *
 * La alternativa era duplicar la paleta en un array aquí y mantenerla a mano junto a la de la hoja
 * de estilos. Duplicar colores es cómo acaban dos gráficos de la misma pantalla con dos azules
 * distintos.
 *
 * La paleta va **en este orden y sin ciclarla**: el color va con la entidad, nunca con su posición,
 * de modo que si un filtro quita una serie las que quedan conservan su color. Que «cobrado» sea
 * verde hoy y naranja mañana según cuántas series haya es la forma más rápida de que nadie se fíe
 * de un gráfico.
 */

/** Cuántos tonos tiene la paleta. Un noveno no se genera: lo que sobra se agrupa en «Otros». */
export const CHART_MAX_SERIES = 8;

/** Las variables de la paleta, en orden. */
const PALETTE_VARIABLES = Array.from(
  { length: CHART_MAX_SERIES },
  (_, index) => `--chart-${index + 1}`,
);

/**
 * Los colores con los que se pinta un gráfico.
 * @interface ChartTheme
 * @property {string[]} palette - Los tonos de las series, en orden
 * @property {string} ink - El texto de los ejes y de la leyenda
 * @property {string} gridLine - Las líneas de la rejilla
 * @property {string} surface - El fondo sobre el que se dibuja, para los aros de separación
 */
export interface ChartTheme {
  palette: string[];
  ink: string;
  gridLine: string;
  surface: string;
}

/**
 * Lee el tema de los gráficos del documento.
 *
 * Devuelve `null` en el servidor: las variables CSS solo existen cuando hay un documento, y un
 * gráfico no se puede pintar sin él de todas formas —ECharts necesita un lienzo—. Quien lo llama
 * espera hasta tener valores en vez de inventarse unos por defecto, que es como se cuela un color
 * que no está en el sistema.
 * @returns {ChartTheme|null} El tema leído, o `null` si todavía no hay documento
 */
export function readChartTheme(): ChartTheme | null {
  if (typeof document === "undefined") return null;

  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();

  return {
    palette: PALETTE_VARIABLES.map(read).filter(Boolean),
    ink: read("--chart-ink"),
    gridLine: read("--chart-grid"),
    surface: read("--chart-surface"),
  };
}

/**
 * En qué orden se reparte la paleta según lo que pinte el gráfico.
 *
 * Son los **mismos ocho tonos**, en otro orden, porque un gráfico de ejes y un reparto no piden lo
 * mismo del color:
 *
 * - **Un reparto** (tarta, anillo, rosa) tiene las porciones ordenadas de mayor a menor, así que la
 *   rampa entera se aprovecha tal cual: la porción más grande sale en el tono más oscuro y la más
 *   pequeña en el más claro, y el color refuerza el orden que ya dice el tamaño.
 * - **Un gráfico de ejes** (línea, área, barras) tiene una o dos series, y lo que hacen falta ahí son
 *   los dos colores de la marca, no dos escalones contiguos de una rampa: «facturado» y «cobrado»
 *   tienen que ser el primario y el fill, que es como se identifican en el resto de la aplicación.
 *   Dos tonos vecinos de la escala se distinguirían peor y no significarían nada.
 *
 * A partir de la tercera serie de un gráfico de ejes se sigue por el interior de la rampa **saltando
 * de un extremo al otro** (el segundo tono, luego el penúltimo, luego el tercero…), que es lo que
 * evita que dos series consecutivas sean dos escalones vecinos — donde la rampa deja de distinguirse.
 *
 * Con las ocho series puestas, el último par **sí** acaba siendo contiguo, y no hay forma de evitarlo:
 * colocados los seis primeros solo queda el par del medio. Lo que consigue la alternancia es decidir
 * el orden en que se gasta la separación, dejando ese caso para el extremo de ocho series en el mismo
 * gráfico y quedándose los tonos más apartados para las una, dos o tres series de siempre.
 *
 * Vive aquí y no en el constructor del gráfico porque la tabla de datos pinta la muestra de color de
 * cada serie y **tiene que coincidir**: esa muestra es lo único que permite pasar del dibujo a la
 * tabla sabiendo cuál era cuál, y con dos ordenaciones distintas diría lo contrario que el gráfico.
 * @param {string[]} palette - La rampa completa leída del documento
 * @param {boolean} isShare - Si el gráfico reparte un total (tarta, anillo, rosa)
 * @returns {string[]} Los mismos tonos, en el orden que le toca a este gráfico
 */
export function seriesPalette(palette: string[], isShare: boolean): string[] {
  if (isShare) return palette;

  const [first, ...rest] = palette;
  if (!first || rest.length === 0) return palette;

  const last = rest[rest.length - 1]!;
  const middle = rest.slice(0, -1);

  // El interior, alternando principio y final: 2.º, penúltimo, 3.º, antepenúltimo…
  const alternated: string[] = [];
  for (let step = 0; step < Math.ceil(middle.length / 2); step += 1) {
    alternated.push(middle[step]!);

    const fromEnd = middle[middle.length - 1 - step];
    if (fromEnd && fromEnd !== middle[step]) alternated.push(fromEnd);
  }

  return [first, last, ...alternated];
}
