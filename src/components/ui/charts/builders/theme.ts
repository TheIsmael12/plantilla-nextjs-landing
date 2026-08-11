import type { EChartsOption } from "echarts";

import { seriesPalette } from "@/constants/charts";

import type { ChartBuildContext } from "@/types/ui/charts/chart";

/**
 * El tema de los gráficos: lo que **todos** comparten, sea cual sea su forma.
 *
 * Vive aparte de los constructores porque es lo que hace que cuatro gráficos distintos en la misma
 * pantalla se lean como uno solo. Si cada constructor eligiera su color de rejilla o su tamaño de
 * letra, el panel acabaría siendo cuatro paneles.
 *
 * Los colores **no están aquí**: llegan en el contexto, leídos de las variables CSS de
 * `00-settings/_colors.scss` (ver `constants/charts.ts`). Así el gráfico usa los mismos tokens que
 * el resto de la aplicación y el tema oscuro se resuelve solo, por cascada.
 *
 * Lo que se decide aquí y no se discute en cada gráfico:
 *
 * - **La paleta**, en el orden fijo del sistema de visualización y sin ciclarla.
 * - **La leyenda**, presente siempre que haya más de una serie: el color nunca puede ser lo único
 *   que identifica a una serie.
 * - **El tooltip**, con el mismo formateador que el eje, para que un importe no salga con dos
 *   decimales arriba y con cero abajo.
 */

/**
 * La parte de la configuración que no depende de la forma del gráfico.
 *
 * Los constructores la extienden; ninguno la reescribe. Un constructor que necesite cambiar algo de
 * aquí es señal de que ese algo no era compartido y hay que sacarlo del tema.
 * @param {ChartBuildContext} context - Datos y contexto del gráfico
 * @param {boolean} isShare - Si es un reparto de un total (tarta, anillo), que cambia el tooltip
 * @returns {EChartsOption} La base común
 */
export function baseOption(context: ChartBuildContext, isShare: boolean): EChartsOption {
  const { theme, formatValue, series } = context;

  return {
    /*
     * El orden de la paleta depende de lo que se pinte, y lo decide `seriesPalette`.
     *
     * En un reparto se usa la rampa entera —la porción mayor en el tono más oscuro—, y en un gráfico
     * de ejes las dos primeras series son el primario y el fill de la marca, que es como se
     * identifican en el resto de la aplicación. La tabla de datos aplica la misma función, para que
     * su muestra de color no diga lo contrario que el dibujo.
     */
    color: seriesPalette(theme.palette, isShare),
    textStyle: { fontFamily: "inherit", color: theme.ink },
    tooltip: {
      /*
       * `axis` en los de eje para que el cursor enseñe **todas** las series de ese punto a la vez:
       * comparar facturado con cobrado obligaba a apuntar a cada línea por separado.
       */
      trigger: isShare ? "item" : "axis",
      valueFormatter: (value) => formatValue(Number(value)),
    },
    legend: {
      // Con una sola serie la leyenda sobra: el título del bloque ya dice qué es.
      show: isShare || series.length > 1,
      bottom: 0,
      left: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: theme.ink, fontSize: 12 },
    },
  };
}
