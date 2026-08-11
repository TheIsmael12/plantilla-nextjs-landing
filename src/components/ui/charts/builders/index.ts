import type { ChartOptionBuilder, ChartType } from "@/types/ui/charts/chart";

import { buildCartesianOption } from "./cartesian";
import { buildCircularOption } from "./circular";

/**
 * Qué constructor arma cada tipo de gráfico.
 *
 * Un mapa y no un `switch` dentro del componente: así el componente no sabe qué tipos existen —solo
 * pide el constructor que toque— y añadir uno es dar de alta una entrada aquí, sin tocar ni el
 * render ni el ciclo de vida del lienzo.
 *
 * Los tipos que comparten armazón comparten constructor: línea, área y barras son el mismo
 * cartesiano con tres propiedades distintas, y separarlos obligaría a repetir la configuración de
 * los ejes tres veces.
 */
export const CHART_BUILDERS: Readonly<Record<ChartType, ChartOptionBuilder>> = {
  line: buildCartesianOption,
  area: buildCartesianOption,
  bar: buildCartesianOption,
  pie: buildCircularOption,
  donut: buildCircularOption,
  rose: buildCircularOption,
};

/**
 * Tipos en los que cada punto es una porción de un total y no un valor sobre un eje.
 *
 * Se necesita fuera de los constructores para dos cosas que decide el componente: de dónde sacar
 * «hay datos» —de la primera serie y no de todas— y si tiene sentido apilar u orientar.
 */
export const SHARE_TYPES: readonly ChartType[] = ["pie", "donut", "rose"];

export { buildCartesianOption, buildCircularOption };
