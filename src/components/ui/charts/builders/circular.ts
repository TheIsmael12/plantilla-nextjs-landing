import type { EChartsOption } from "echarts";

import type { ChartBuildContext } from "@/types/ui/charts/chart";

import { baseOption } from "./theme";

/**
 * El radio de cada forma de reparto.
 *
 * La rosa arranca de un radio interior pequeño y no de cero: con la punta en el centro, dos
 * porciones de valor parecido acaban siendo dos cuñas que se tocan en un vértice y no hay forma de
 * comparar sus longitudes.
 * @param {ChartType} type - Qué forma se está pintando
 * @returns {string | [string, string]} El radio, tal y como lo espera ECharts
 */
function radiusFor(type: ChartBuildContext["type"]): [number, number] {
  if (type === "donut") return [0.54, 0.8];
  if (type === "rose") return [0.22, 0.8];

  return [0, 0.74];
}

/** Alto de un renglón de leyenda: 12 px de letra más el aire que ECharts deja entre líneas. */
const LEGEND_LINE_HEIGHT = 20;

/** El aire entre el borde de abajo y la leyenda, más el que la separa del dibujo. */
const LEGEND_PADDING = 14;

/** Píxeles que ocupa una letra de la leyenda a 12 px, medido sobre la tipografía del sistema. */
const LEGEND_CHAR_WIDTH = 6.6;

/** La muestra de color de cada entrada más su hueco, y el aire hasta la siguiente (`itemGap`). */
const LEGEND_ITEM_CHROME = 13 + 18;

/**
 * Cuánto del alto puede llevarse la leyenda como mucho.
 *
 * Es el tope que decide cuándo la leyenda deja de crecer y pasa a desplazarse. Sin él, ocho porciones
 * en un lienzo bajo pedían ocho renglones —174 de 200 píxeles— y al anillo no le quedaba sitio ni
 * encogiéndolo: o se solapaba, o se quedaba en una moneda de doce píxeles que no dice nada.
 *
 * Un tercio: por debajo de eso el dibujo sigue siendo lo principal de la tarjeta, que es de lo que va
 * un gráfico. Pasado el tope, la leyenda se queda en un renglón con flechas (`type: "scroll"`), que es
 * lo que ECharts trae para esto y es mejor que las dos alternativas.
 */
const MAX_LEGEND_RATIO = 1 / 3;

/**
 * Cuánto alto se lleva la leyenda de un reparto.
 *
 * Hay que calcularlo, y no vale reservar un hueco fijo: **la leyenda de un reparto son los nombres de
 * todas las porciones**, así que con cuatro servicios cabe en un renglón y con doce ocupa tres. Con un
 * hueco fijo, o se desperdicia sitio cuando hay pocos o el anillo se come la leyenda cuando hay muchos
 * — que es exactamente lo que pasaba: en el gráfico de tarta con muchos datos, la leyenda se
 * superponía al dibujo.
 *
 * Los renglones se estiman por el ancho que ocupa cada entrada: la muestra de color, el aire y el
 * nombre. Es una estimación —no se puede medir texto sin pintarlo— y por eso se redondea siempre hacia
 * arriba: sobrar medio renglón de hueco no se nota, y faltar medio es el solape que se venía a quitar.
 * @param {string[]} categories - Los nombres de las porciones, que son las entradas de la leyenda
 * @param {number} width - Ancho disponible en píxeles; `0` si todavía no se ha medido
 * @returns {number} El alto en píxeles que hay que reservarle
 */
function legendHeight(categories: string[], width: number): number {
  if (categories.length === 0) return 0;

  const widest = categories.reduce(
    (longest, name) => Math.max(longest, name.length * LEGEND_CHAR_WIDTH + LEGEND_ITEM_CHROME),
    0,
  );

  // Sin ancho medido todavía se supone un renglón: es lo que había antes y no empeora nada.
  const perRow = width > 0 ? Math.max(Math.floor(width / widest), 1) : categories.length;
  const rows = Math.ceil(categories.length / perRow);

  return rows * LEGEND_LINE_HEIGHT + LEGEND_PADDING;
}

/**
 * Los gráficos de reparto: tarta, anillo y rosa.
 *
 * Solo pintan **la primera serie**, y no es una limitación técnica: una tarta contesta «de qué se
 * compone este total», y dos totales superpuestos no contestan a nada. Si hacen falta dos, son dos
 * gráficos.
 *
 * El anillo lleva hueco central a propósito: comparar dos arcos es más fácil por su longitud que
 * por su superficie, y en una tarta maciza la punta central estira los sectores pequeños.
 *
 * La rosa —el diagrama de Nightingale— reparte el círculo en porciones **del mismo ángulo** y deja
 * que lo que cambie sea el radio. Sirve cuando lo que se quiere ver es el ranking: con seis
 * servicios de tamaño parecido, seis arcos casi iguales no se ordenan de un vistazo y seis pétalos
 * de distinta altura sí. Va con `roseType: "area"` y no con `"radius"`: en `area` la superficie del
 * pétalo es proporcional al valor, mientras que en `radius` un valor el doble de grande dibuja un
 * pétalo cuatro veces mayor, que es exagerar el dato.
 *
 * Entre porciones va un aro del color del fondo. Sin él, dos tonos contiguos de la paleta se leen
 * como una sola mancha, que es justo el fallo que hace que una tarta no se pueda contar.
 * @param {ChartBuildContext} context - Datos y contexto del gráfico
 * @returns {EChartsOption} La configuración del gráfico de reparto
 */
export function buildCircularOption(context: ChartBuildContext): EChartsOption {
  const { type, series, categories, theme, width, height } = context;
  const base = baseOption(context, true);

  /*
   * El dibujo se queda con el alto que **sobra** después de la leyenda.
   *
   * Antes el anillo iba a un `center: ["50%", "44%"]` fijo con un radio del 80 %, números elegidos
   * para el caso de cuatro o cinco porciones. Con muchas, la leyenda pasaba a ocupar tres renglones y
   * el dibujo —que no se enteraba— le caía encima. Ahora se descuenta lo que la leyenda va a medir y
   * el anillo se centra y se escala en lo que queda: con pocas porciones sale igual de grande que
   * antes, y con muchas se encoge en vez de solaparse.
   *
   * Se expresa en porcentaje del alto total y no en píxeles porque el porcentaje sobrevive a un cambio
   * de tamaño sin volver a construir nada, y el radio de ECharts ya es relativo al lado menor.
   */
  const wanted = legendHeight(categories, width);
  const cap = height > 0 ? height * MAX_LEGEND_RATIO : Number.POSITIVE_INFINITY;

  /*
   * Si la leyenda pide más de lo que se le puede dar, se desplaza en vez de crecer.
   *
   * Es el caso de un reparto con muchas porciones en un lienzo bajo: la leyenda quería ocho renglones
   * de los diez que hay, y no había forma de encoger el anillo lo suficiente. Con un renglón y flechas
   * se ven todas igualmente —desplazándolas— y el dibujo conserva su sitio.
   */
  const scrollLegend = wanted > cap;
  const reserved = scrollLegend ? LEGEND_LINE_HEIGHT + LEGEND_PADDING : wanted;

  const usableRatio = height > 0 ? Math.max((height - reserved) / height, 0.35) : 1;

  const [inner, outer] = radiusFor(type);
  const scaledRadius: [string, string] = [
    `${(inner * usableRatio * 100).toFixed(1)}%`,
    `${(outer * usableRatio * 100).toFixed(1)}%`,
  ];

  return {
    ...base,
    /*
     * La leyenda de un reparto se lleva más sitio que la de un gráfico de ejes: son los nombres de
     * todas las porciones, no dos nombres de serie. Se centra y se separan los elementos entre sí; el
     * hueco que necesita lo calcula `legendHeight` y se lo descuenta el dibujo.
     */
    legend: {
      ...base.legend,
      ...(scrollLegend ? { type: "scroll" as const } : {}),
      left: "center",
      itemGap: 18,
      padding: [12, 0, 0, 0],
    },
    series: [
      {
        type: "pie",
        radius: scaledRadius,
        // Centrado en la mitad del hueco que le queda, no en la de la tarjeta.
        center: ["50%", `${(usableRatio * 50).toFixed(1)}%`],
        // El reparto por radio, solo en la rosa: en la tarta y el anillo el ángulo es el dato.
        ...(type === "rose" ? { roseType: "area" as const } : {}),
        itemStyle: {
          borderColor: theme.surface,
          borderWidth: 2,
          // La punta redondeada es lo que hace que un pétalo se lea como un pétalo y no como un
          // trozo de tarta al que le falta el resto.
          ...(type === "rose" ? { borderRadius: 6 } : {}),
        },
        /*
         * Sin rótulos colgando de cada porción.
         *
         * ECharts los saca fuera del anillo con una línea guía, y dicen exactamente lo mismo que
         * la leyenda de abajo: el nombre de la porción. Repetido dos veces, lo único que aportan
         * es un cerco de texto que obliga a encoger el anillo hasta la mitad de la tarjeta, y con
         * nombres largos —«Conserjería L - V de 09:00 a 18:00»— además salen cortados.
         *
         * La identidad la lleva la leyenda, que siempre está en un reparto; la cifra exacta la dan
         * el cursor y la tabla de datos. El anillo se queda para lo suyo, que es la proporción.
         */
        label: { show: false },
        labelLine: { show: false },
        data: categories.map((name, index) => ({
          name,
          value: series[0]?.data[index] ?? 0,
        })),
      },
    ],
  };
}
