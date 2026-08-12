/**
 * Los puntos de ruptura del sistema de diseño, en píxeles.
 *
 * Son un espejo de `$breakpoints` en `src/styles/01-tools/_query.scss`, que es la fuente de verdad
 * para el CSS. Hacen falta aquí porque unos pocos componentes cambian de **estructura**, no solo de
 * aspecto: un desplegable que en móvil pasa a ser una hoja inferior tiene que bloquear el scroll de
 * la página y ofrecer un botón de cerrar, y ninguna de las dos cosas se puede decidir desde una
 * media query. Si se toca el SCSS hay que tocar esto: el
 * componente cambiaría de forma en un ancho distinto al que cambian sus estilos, y el resultado es una
 * hoja inferior con estilos de desplegable.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** Nombre de un punto de ruptura del sistema de diseño. */
export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * La media query equivalente a `@include screen($breakpoint, max)`.
 *
 * El `- 1` es el mismo que aplica el mixin de Sass: `md` vale 768 px y `md, max` significa «hasta
 * 767 px», no «hasta 768». Sin restarlo, a exactamente 768 px de ancho estarían activos a la vez el
 * estilo de móvil y el de escritorio.
 * @param {Breakpoint} breakpoint - Punto de ruptura por debajo del cual la consulta es cierta
 * @returns {string} La media query lista para `window.matchMedia`
 */
export function below(breakpoint: Breakpoint): string {
  return `(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`;
}
