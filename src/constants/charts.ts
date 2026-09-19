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
 * A partir de cuántas porciones un reparto usa la rampa completa en vez del primario/fill.
 *
 * Con 2 o 3 porciones el reparto casi siempre es un estado con dos polos y un intermedio —abierta/
 * cerrada, pendiente/pagado— y ahí el color tiene que decir lo mismo que dice en un gráfico de ejes:
 * los dos extremos son el primario y el fill de la marca. Con 4 o más porciones ya no hay dos polos
 * que identificar, y es cuando tiene sentido la rampa entera ordenada de mayor a menor.
 */
const SHARE_POLARIZED_MAX_SLICES = 3;

/**
 * En qué orden se reparte la paleta según lo que pinte el gráfico.
 *
 * Son los **mismos ocho tonos**, en otro orden, porque no todos los repartos y gráficos de ejes
 * piden lo mismo del color:
 *
 * - **Un reparto con pocas porciones** (2 o 3: abierta/cerrada, pendiente/pagado…) tiene dos polos
 *   que identificar, igual que un gráfico de ejes: los dos extremos de la rampa son el primario y el
 *   fill de la marca, que es como esos mismos conceptos se leen en el resto de la aplicación. Con
 *   tres porciones, el color respeta además la **posición** de la que va en medio —«resuelta» entre
 *   «abierta» y «cerrada»—: si fuera `[primario, fill, intermedio]`, «cerrada» (la tercera porción,
 *   la que de verdad está en el otro polo) se quedaría con el tono intermedio y «resuelta» con el
 *   fill, que es leer los dos extremos al revés de cómo están puestas las porciones. El orden que
 *   coincide con las posiciones es `[primario, intermedio, fill]`.
 * - **Un reparto con muchas porciones** (4 o más) ya no tiene dos polos que resaltar: ahí la rampa
 *   entera se aprovecha tal cual, ordenada de mayor a menor, con la porción más grande en el tono
 *   más oscuro y la más pequeña en el más claro — el color refuerza el orden que ya dice el tamaño.
 * - **Un gráfico de ejes** (línea, área, barras) tiene una o dos series con el mismo criterio de
 *   polos: «facturado» y «cobrado» son el primario y el fill, no dos escalones contiguos de la
 *   rampa, que se distinguirían peor y no significarían nada.
 *
 * A partir de la tercera serie de un gráfico de ejes (o la cuarta porción de un reparto grande) se
 * sigue por el interior de la rampa **saltando de un extremo al otro** (el segundo tono, luego el
 * penúltimo, luego el tercero…), que es lo que evita que dos series consecutivas sean dos escalones
 * vecinos — donde la rampa deja de distinguirse.
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
 * @param {number} [sliceCount] - Cuántas porciones tiene el reparto; sin ella (o con un gráfico de ejes) se usa siempre el criterio de polos
 * @returns {string[]} Los mismos tonos, en el orden que le toca a este gráfico
 */
export function seriesPalette(
  palette: string[],
  isShare: boolean,
  sliceCount?: number,
): string[] {
  const usesFullRamp = isShare && (sliceCount ?? 0) > SHARE_POLARIZED_MAX_SLICES;
  if (usesFullRamp) return palette;

  const [first, ...rest] = palette;
  if (!first || rest.length === 0) return palette;

  const last = rest[rest.length - 1]!;
  const middle = rest.slice(0, -1);

  // Reparto de exactamente tres porciones: la del medio va con el tono intermedio de la rampa, no
  // con el fill — es la única forma en la que el color respeta qué porción está en cada polo y cuál
  // va entre medias (ver el porqué en el comentario de la función).
  if (isShare && sliceCount === 3 && middle.length > 0) {
    const middleTone = middle[Math.floor((middle.length - 1) / 2)]!;
    return [first, middleTone, last];
  }

  // El interior, alternando principio y final: 2.º, penúltimo, 3.º, antepenúltimo…
  const alternated: string[] = [];
  for (let step = 0; step < Math.ceil(middle.length / 2); step += 1) {
    alternated.push(middle[step]!);

    const fromEnd = middle[middle.length - 1 - step];
    if (fromEnd && fromEnd !== middle[step]) alternated.push(fromEnd);
  }

  return [first, last, ...alternated];
}
