import type { EChartsOption } from "echarts";

import type { ChartBuildContext } from "@/types/ui/charts/chart";

import { baseOption } from "./theme";

/** A partir de cuántos puntos deja de pintarse el símbolo de cada dato. */
const MAX_VISIBLE_SYMBOLS = 31;

/** Ancho máximo de una barra: más gruesa se lee como un bloque, no como una medida. */
const MAX_BAR_WIDTH = 28;

/**
 * Píxeles que necesita una etiqueta de categoría para caber en horizontal.
 *
 * Sale de lo que mide la etiqueta más común del sistema —un mes abreviado, «sept.»— a 12 px, más
 * el aire mínimo entre dos. Por debajo de esto, ECharts empieza a saltarse etiquetas: en un móvil,
 * un gráfico de doce meses se quedaba rotulando uno de cada tres.
 */
const CATEGORY_LABEL_MIN_WIDTH = 44;

/** Cuánto se giran las etiquetas cuando no caben: lo justo para leerlas sin poner la cabeza de lado. */
const CATEGORY_LABEL_ROTATION = 40;

/**
 * Los gráficos con ejes: línea, área y barras.
 *
 * Van juntos en un constructor y no en tres porque **comparten el armazón**: los mismos dos ejes,
 * la misma rejilla y el mismo apilado. Lo único que cambia entre ellos son tres propiedades de la
 * serie, y partirlos obligaría a repetir la configuración de los ejes tres veces con el riesgo de
 * que se separen.
 *
 * Dos decisiones que se toman aquí:
 *
 * - **El símbolo de cada punto desaparece por encima de un mes de datos.** Con 365 puntos, los
 *   círculos se tocan y la línea se convierte en una cinta.
 * - **El redondeo va solo en la punta de la barra.** La base sigue pegada al eje, que es de donde
 *   se mide: redondear las cuatro esquinas hace que una barra pequeña parezca más corta de lo que
 *   es.
 * @param {ChartBuildContext} context - Datos y contexto del gráfico
 * @returns {EChartsOption} La configuración del gráfico cartesiano
 */
export function buildCartesianOption(context: ChartBuildContext): EChartsOption {
  const { type, series, categories, stacked, horizontal, theme, width, formatValue } = context;
  const { ink, gridLine } = theme;

  /*
   * Las etiquetas se giran cuando no caben, en vez de dejar que se salten.
   *
   * Sin esto, un gráfico de doce meses en un móvil rotulaba «ene.», «abr.», «jul.», «oct.» y ya:
   * ECharts descarta las que se pisarían, así que a menos ancho, menos referencias justo cuando
   * más falta hacen. Giradas caben todas.
   *
   * El giro solo aplica al eje de categorías en vertical: en barras horizontales las categorías van
   * en el eje Y, una por renglón, donde no se pisan nunca. Y con el ancho aún sin medir (`0`) no se
   * gira: el primer dibujo se hace sin saber el sitio que hay, y girar por si acaso dejaría el
   * gráfico torcido durante un fotograma en escritorio, que es donde se abre casi siempre.
   */
  const rotateLabels =
    !horizontal &&
    width > 0 &&
    categories.length > 0 &&
    width / categories.length < CATEGORY_LABEL_MIN_WIDTH;

  const categoryAxis = {
    type: "category" as const,
    data: categories,
    axisLabel: {
      color: ink,
      fontSize: 12,
      rotate: rotateLabels ? CATEGORY_LABEL_ROTATION : 0,
      // Con el giro puesto, que ECharts intente pintarlas **todas** antes de descartar ninguna.
      interval: rotateLabels ? 0 : ("auto" as const),
      hideOverlap: true,
    },
    axisLine: { lineStyle: { color: gridLine } },
    axisTick: { show: false },
  };

  const valueAxis = {
    type: "value" as const,
    axisLabel: { color: ink, fontSize: 12, formatter: (value: number) => formatValue(value) },
    splitLine: { lineStyle: { color: gridLine, type: "dashed" as const } },
  };

  return {
    ...baseOption(context, false),
    grid: {
      left: 8,
      right: 16,
      top: 16,
      // Hueco abajo solo cuando hay leyenda; si no, el gráfico flota sobre un espacio vacío.
      bottom: series.length > 1 ? 40 : 16,
      containLabel: true,
    },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: series.map((serie) => ({
      name: serie.name,
      type: type === "bar" ? ("bar" as const) : ("line" as const),
      data: serie.data,
      stack: stacked ? "total" : undefined,
      smooth: type !== "bar",
      // Marcas finas: la línea es el dato, no la tinta.
      lineStyle: { width: 2 },
      symbolSize: 8,
      showSymbol: serie.data.length <= MAX_VISIBLE_SYMBOLS,
      areaStyle: type === "area" ? { opacity: 0.14 } : undefined,
      itemStyle:
        type === "bar" ? { borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] } : undefined,
      barMaxWidth: MAX_BAR_WIDTH,
    })),
  };
}
