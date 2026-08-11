/**
 * El único sitio donde se registra Apache ECharts.
 *
 * ECharts no se importa entero (`import * as echarts from "echarts"`) sino **por piezas**: el
 * paquete completo pasa del megabyte y entraría en el primer JavaScript que descarga cualquiera que
 * abra la aplicación, use o no un gráfico. A cambio, cada tipo de gráfico y cada componente —ejes,
 * leyenda, tooltip— hay que registrarlo, y ese registro vive aquí y no repartido por los
 * componentes: si estuviera dentro de `Chart.tsx`, añadir un tipo obligaría a tocar el componente,
 * y si estuviera en cada constructor, dos gráficos podrían registrar cosas distintas y el mismo
 * `type` se comportaría distinto según cuál se montara antes.
 *
 * **Para añadir un tipo de gráfico** hacen falta tres cosas y ninguna más:
 *
 * 1. Registrar aquí su módulo (`ScatterChart`, `GaugeChart`…) y los componentes que necesite.
 * 2. Escribir su constructor en `builders/`, y darlo de alta en `builders/index.ts`.
 * 3. Añadir su nombre a `ChartType`, en `types/ui/charts/chart.d.ts`.
 *
 * El registro se ejecuta una sola vez al importar este módulo, que es como ECharts espera que se
 * use: llamar a `use` dos veces con lo mismo no rompe nada, pero tampoco hace falta.
 */
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  // Tipos de gráfico. Los tres que hoy sabe pintar `Chart`.
  LineChart,
  BarChart,
  PieChart,
  // Piezas compartidas: los ejes, la leyenda y el tooltip los usan todos.
  GridComponent,
  LegendComponent,
  TooltipComponent,
  // El conjunto de datos y la línea de referencia, que usan los constructores cartesianos.
  DatasetComponent,
  MarkLineComponent,
  // Recoloca las etiquetas que se pisan; sin esto, una tarta con porciones pequeñas se solapa.
  LabelLayout,
  /*
   * Lienzo y no SVG: un panel puede tener cuatro gráficos con doce meses cada uno, y con SVG eso
   * son miles de nodos en el DOM que el navegador vuelve a calcular en cada `resize`.
   */
  CanvasRenderer,
]);

export { echarts };
