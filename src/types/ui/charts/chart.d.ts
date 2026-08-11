import type { EChartsOption } from "echarts";

import type { ChartTheme } from "@/constants/charts";

/**
 * Tipos de gráfico que sabe pintar {@link Chart}.
 *
 * Deliberadamente cortos: cada uno tiene **un trabajo**. `line` para cómo cambia algo con el
 * tiempo, `area` para un acumulado en el tiempo, `bar` para comparar magnitudes entre categorías,
 * `pie`/`donut` para un reparto de un total —y solo con pocas porciones—, y `rose` para ese mismo
 * reparto cuando lo que interesa es el orden: la rosa da a todas las porciones el mismo ángulo y
 * varía el radio, así que seis valores parecidos se ordenan de un vistazo en vez de quedarse en
 * seis arcos casi iguales. No hay tarta 3D, ni doble eje, ni líneas con veinte series: no se ha
 * dejado fuera por falta de tiempo, es que no se leen.
 *
 * Añadir uno nuevo son tres pasos, y están escritos en `components/ui/charts/echarts-setup.ts`.
 * @typedef {("line"|"area"|"bar"|"pie"|"donut"|"rose")} ChartType
 */
export type ChartType = "line" | "area" | "bar" | "pie" | "donut" | "rose";

/**
 * Una serie de datos de {@link Chart}.
 *
 * El color **no** se elige aquí: lo asigna el componente por el orden de la serie, siempre el
 * mismo, para que un filtro que quita una serie no repinte las que quedan. Si el verde era el de
 * «cobrado», sigue siendo el de «cobrado».
 * @interface ChartSeries
 * @property {string} name - Nombre de la serie, tal y como sale en la leyenda y en el tooltip
 * @property {number[]} data - Valores, en el mismo orden que `categories`
 */
export interface ChartSeries {
  name: string;
  data: number[];
}

/**
 * Lo que recibe un constructor de opciones para armar su gráfico.
 *
 * Es el contrato entre {@link Chart} y `builders/`: el componente resuelve el tema y el idioma, y
 * el constructor solo decide **la forma**. Así el tema se escribe una vez y ningún tipo de gráfico
 * puede tener su propia idea de qué color es la rejilla.
 * @interface ChartBuildContext
 * @property {ChartType} type - Qué se está pintando
 * @property {ChartSeries[]} series - Las series, ya validadas
 * @property {string[]} categories - Etiquetas del eje, o de las porciones
 * @property {boolean} stacked - Apilar, cuando el tipo lo admite
 * @property {boolean} horizontal - Girar el eje, cuando el tipo lo admite
 * @property {ChartTheme} theme - Los colores, ya leídos de las variables CSS del documento
 * @property {number} width - Ancho disponible en píxeles, redondeado a tramos, o `0` antes de la primera medición. Lo usan las decisiones que dependen del sitio que hay: girar las etiquetas del eje cuando no caben en horizontal, o contar cuántos renglones va a ocupar la leyenda
 * @property {number} height - Alto del lienzo en píxeles, exacto (lo fija quien usa el gráfico). Es lo que permite descontar el sitio que se lleva la leyenda antes de decidir el tamaño de un anillo
 * @property {(value: number) => string} formatValue - Cómo se escribe un valor en el eje y el tooltip
 */
export interface ChartBuildContext {
  type: ChartType;
  series: ChartSeries[];
  categories: string[];
  stacked: boolean;
  horizontal: boolean;
  theme: ChartTheme;
  width: number;
  height: number;
  formatValue: (value: number) => string;
}

/**
 * Un constructor de opciones: de los datos y el contexto, a la configuración de ECharts.
 * @typedef {(context: ChartBuildContext) => EChartsOption} ChartOptionBuilder
 */
export type ChartOptionBuilder = (context: ChartBuildContext) => EChartsOption;

/**
 * Props de {@link Chart}: envoltorio del sistema de diseño sobre ECharts.
 *
 * Existe para que ninguna vista configure ECharts a mano. La paleta, la tipografía, la rejilla, el
 * tooltip y el comportamiento en tema oscuro se deciden una vez; una vista solo dice qué datos
 * tiene y de qué tipo son.
 * @interface ChartProps
 * @property {ChartType} type - Qué trabajo hace el gráfico
 * @property {ChartSeries[]} series - Series a pintar; en los repartos se usa solo la primera
 * @property {string[]} categories - Etiquetas del eje X, o de las porciones en los repartos
 * @property {number} [height] - Alto en píxeles; por defecto 320
 * @property {boolean} [stacked] - Apila las barras en vez de ponerlas una al lado de otra
 * @property {boolean} [horizontal] - Barras horizontales, para categorías con nombres largos
 * @property {(value: number) => string} [formatValue] - Cómo se escribe un valor en el eje y en el tooltip (importes, porcentajes…)
 * @property {string} [emptyMessage] - Qué decir cuando no hay ni un dato; sin él se usa el texto por defecto
 * @property {string} [ariaLabel] - Descripción del gráfico para quien no lo ve; si se omite, se compone con los nombres de las series
 * @property {boolean} [hideTable] - Esconde la tabla de respaldo; solo para cuando esos mismos datos ya están en una tabla al lado
 * @property {(index: number) => void} [onSelect] - Se invoca con la **posición** de la categoría pulsada. Se pasa el índice y no la categoría porque el nombre no identifica nada: dos servicios pueden llamarse igual, y quien pinta el gráfico es el único que sabe a qué recurso corresponde cada posición. Con `onSelect` puesto, el lienzo se anuncia como pulsable y **la tabla de respaldo enlaza igual**, que es lo que hace que la navegación no dependa de acertarle a un pétalo con el ratón
 * @property {string} [className] - Clases CSS adicionales del contenedor
 */
export interface ChartProps {
  type: ChartType;
  series: ChartSeries[];
  categories: string[];
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
  formatValue?: (value: number) => string;
  emptyMessage?: string;
  ariaLabel?: string;
  hideTable?: boolean;
  onSelect?: (index: number) => void;
  className?: string;
}
