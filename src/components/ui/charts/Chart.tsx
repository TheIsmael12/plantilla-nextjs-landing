"use client";

import "@/styles/04-components/ui/charts/chart.scss";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ECharts } from "echarts/core";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import type { EChartsOption } from "echarts";

import { readChartTheme, type ChartTheme } from "@/constants/charts";
import { useIsMounted } from "@/hooks/useIsMounted";

import type { ChartProps } from "@/types/ui/charts/chart";

import ChartDataTable from "./ChartDataTable";
import { CHART_BUILDERS, SHARE_TYPES } from "./builders";
import { echarts } from "./echarts-setup";

/**
 * A qué tramo se redondea el ancho del lienzo antes de dárselo a los constructores.
 *
 * 48 px es aproximadamente lo que ocupa una etiqueta de eje, así que es el grano por debajo del
 * cual la decisión que se toma con el ancho —caben las etiquetas en horizontal o no— no cambia.
 * Redondear evita rehacer la configuración del gráfico en cada píxel de un arrastre de la ventana.
 */
const WIDTH_STEP_PX = 48;

/**
 * Gráfico del sistema de diseño, sobre Apache ECharts.
 *
 * Este fichero se ocupa **solo del lienzo**: crearlo, repintarlo, redimensionarlo y destruirlo. La
 * forma de cada gráfico vive en `builders/`, el tema compartido en `builders/theme.ts` y el
 * registro de la librería en `echarts-setup.ts`. Está partido así porque son tres cosas que cambian
 * por motivos distintos: se añade un tipo de gráfico mucho más a menudo de lo que se cambia cómo se
 * monta un lienzo.
 *
 * Lo que el envoltorio garantiza, y por eso ninguna vista configura ECharts a mano:
 *
 * - **Un solo eje.** No hay doble escala. Dos magnitudes distintas son dos gráficos: un eje
 *   secundario deja que la forma de las curvas diga lo que quiera quien elige las escalas.
 * - **La leyenda está siempre** con dos o más series, y hay tooltip en cada punto: el color nunca
 *   es lo único que identifica a una serie.
 * - **El color va con la entidad, no con su orden de llegada**: se asigna por la posición de la
 *   serie, que la vista mantiene estable, así que quitar una no repinta las demás.
 * - **Debajo del lienzo va la tabla** con los mismos datos, que es la salida para quien no lo ve y
 *   para quien no distingue dos series por su color.
 *
 * **Los colores no están en este fichero.** Salen de las variables `--chart-*` de
 * `00-settings/_colors.scss`, que se leen del documento al montar: así el gráfico usa los mismos
 * tokens que el resto de la aplicación y el tema oscuro —que tiene su propia paleta escalonada
 * contra el fondo oscuro, no un volteo automático de la clara— se resuelve por cascada.
 * @param {ChartProps} props - Propiedades del gráfico
 * @returns {JSX.Element} El gráfico renderizado
 */
export default function Chart({
  type,
  series,
  categories,
  height = 320,
  stacked = false,
  horizontal = false,
  formatValue,
  emptyMessage,
  ariaLabel,
  hideTable = false,
  onSelect,
  className,
}: ChartProps) {
  const t = useTranslations("Common.Chart");
  const { resolvedTheme } = useTheme();

  const container = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);

  /*
   * El tamaño **medido** del lienzo, no el que se pidió.
   *
   * Se mide y no se usa la prop `height` porque en muchas pantallas no coinciden: en las tarjetas del
   * panel, el lienzo lleva `flex: 1 1 auto` para llenar el hueco que quede, así que su alto real lo
   * decide el reparto de la tarjeta y la prop es solo un mínimo. Dándole al constructor el alto pedido,
   * el sitio que reserva para la leyenda se calculaba sobre un número que no era el de la pantalla.
   *
   * El ancho va redondeado a tramos de {@link WIDTH_STEP_PX} y el alto exacto, y la diferencia es
   * deliberada: del ancho solo depende una decisión de grano grueso —si las etiquetas del eje caben en
   * horizontal—, y guardarlo al píxel rehacía la configuración cientos de veces al arrastrar la ventana.
   * Del alto, en cambio, depende dónde se centra un anillo, y ahí un error de 48 px se ve.
   */
  const [size, setSize] = useState({ width: 0, height: 0 });

  /*
   * Los colores se leen del documento, y por eso hay que esperar a tenerlo.
   *
   * En el servidor no hay variables CSS que consultar, así que hasta estar montado no hay tema y
   * el lienzo no se crea. No se usa una paleta por defecto mientras tanto: un color inventado
   * durante un fotograma es un color que no está en el sistema, y el cambio se vería.
   *
   * Se vuelve a leer al cambiar de tema: los valores de `--chart-*` son otros dentro de `.dark`.
   */
  const isMounted = useIsMounted();
  const theme = useMemo<ChartTheme | null>(
    () => (isMounted ? readChartTheme() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `resolvedTheme` no se usa dentro, pero es lo que cambia los valores que se leen del documento
    [isMounted, resolvedTheme],
  );

  const isShare = SHARE_TYPES.includes(type);

  const hasData = isShare
    ? (series[0]?.data.length ?? 0) > 0
    : series.some((serie) => serie.data.length > 0);

  const option = useMemo<EChartsOption | null>(
    () =>
      theme
        ? CHART_BUILDERS[type]({
            type,
            series,
            categories,
            stacked,
            horizontal,
            theme,
            width: size.width,
            // El alto medido si ya se midió; el pedido mientras no, que es mejor que un cero.
            height: size.height || height,
            formatValue: formatValue ?? ((value: number) => String(value)),
          })
        : null,
    [type, series, categories, stacked, horizontal, theme, size, height, formatValue],
  );

  /*
   * El lienzo se crea **una sola vez** por montaje, y se redimensiona.
   *
   * Antes este efecto dependía también de `option`, así que cada vez que el padre repintaba se
   * destruía el gráfico y se creaba otro. Y el padre repinta a menudo: casi todas las vistas pasan
   * `series={[{ name, data }]}` en línea, que es un objeto nuevo en cada render, así que la
   * configuración cambiaba de identidad sin cambiar de contenido. El resultado era un gráfico que
   * se reconstruía de cero —perdiendo su tamaño, su animación y el punto donde estaba el cursor— y
   * que, si el repintado coincidía con un cambio de ancho, se quedaba con el tamaño anterior. Eso
   * es lo que se veía como «el responsive no se actualiza bien».
   */
  useEffect(() => {
    if (!container.current || !hasData) return;

    const element = container.current;
    const chart = echarts.init(element);
    chartRef.current = chart;

    /*
     * El aviso de cambio de tamaño se atiende en el fotograma siguiente.
     *
     * Redimensionar dentro del propio callback del observador provoca otra medición en el mismo
     * ciclo —el famoso «ResizeObserver loop completed with undelivered notifications»— y deja el
     * lienzo con el tamaño de la medición anterior. Aplazarlo un fotograma lo mide ya asentado.
     *
     * Se observa el contenedor y no la ventana porque lo que cambia de ancho aquí no es la ventana:
     * también lo hacen plegar el menú lateral, abrir un panel lateral o cambiar de pestaña.
     */
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        chart.resize();

        const measured = {
          width: Math.round(element.clientWidth / WIDTH_STEP_PX) * WIDTH_STEP_PX,
          height: element.clientHeight,
        };

        // Solo si de verdad ha cambiado: el observador también avisa de cambios que no mueven ninguna
        // de las dos medidas que se guardan, y un `setSize` con el mismo objeto es un render de más.
        setSize((previous) =>
          previous.width === measured.width && previous.height === measured.height
            ? previous
            : measured,
        );
      });
    });
    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [hasData]);

  // Los datos, aparte del lienzo: cambiar lo que se pinta no vuelve a crearlo.
  useEffect(() => {
    if (!chartRef.current || !option) return;

    // `notMerge`: al quitar una serie, mezclar dejaría la vieja pintada encima de las que quedan.
    chartRef.current.setOption(option, true);
  }, [option]);

  /*
   * El clic en una porción, aparte del lienzo y aparte de los datos.
   *
   * En su propio efecto porque `onSelect` es casi siempre una función en línea —una flecha que navega—
   * y por tanto nueva en cada render del padre: metido en el efecto que crea el lienzo, lo destruiría
   * y lo volvería a crear constantemente, que es justo el fallo que se acaba de quitar de en medio.
   *
   * Se manda `dataIndex` y no el nombre de la categoría: el nombre no identifica nada —dos servicios
   * del catálogo pueden llamarse igual— y quien pinta el gráfico es el único que sabe qué recurso hay
   * en cada posición.
   */
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !onSelect) return;

    const handler = (params: { dataIndex?: number }) => {
      if (typeof params.dataIndex === "number") onSelect(params.dataIndex);
    };

    chart.on("click", handler);

    return () => {
      // Con llaves y no con la flecha directa: `off` devuelve la instancia, y devolverla haría que
      // React la tomara por la función de limpieza.
      chart.off("click", handler);
    };
    // `option` está en las dependencias porque al reemplazarlo con `notMerge` ECharts se lleva por
    // delante los oyentes de la serie: hay que volver a engancharlo después de cada `setOption`.
  }, [onSelect, option]);

  const description =
    ariaLabel ?? t("description", { series: series.map((serie) => serie.name).join(", ") });

  if (!hasData) {
    return (
      <p className={`chart__empty${className ? ` ${className}` : ""}`}>
        {emptyMessage ?? t("empty")}
      </p>
    );
  }

  return (
    <figure className={`chart${className ? ` ${className}` : ""}`}>
      {/*
        El lienzo no dice nada a quien no lo ve: se anuncia como imagen con su descripción.

        Con `onSelect` se le añade el cursor de mano, pero **no** se le pone `tabIndex` ni se
        convierte en botón: es un mapa de píxeles, y un botón que envuelve el gráfico entero solo
        podría navegar a una porción cualquiera. La vía por teclado es la tabla de datos, donde cada
        fila es un botón con su nombre — ahí sí hay una porción concreta que pulsar.
      */}
      <div
        ref={container}
        className={`chart__canvas${onSelect ? " chart__canvas--clickable" : ""}`}
        style={{ height }}
        role="img"
        aria-label={description}
      />

      {!hideTable && (
        <ChartDataTable
          series={series}
          categories={categories}
          caption={description}
          isShare={isShare}
          formatValue={formatValue}
          onSelect={onSelect}
        />
      )}
    </figure>
  );
}
