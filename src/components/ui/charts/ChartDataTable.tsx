"use client";

import { useMemo, useState } from "react";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import ModalComponent from "@/components/ui/modals/ModalComponent";

import { readChartTheme, seriesPalette } from "@/constants/charts";
import { useIsMounted } from "@/hooks/useIsMounted";

import type { ChartSeries } from "@/types/ui/charts/chart";

import { InfoIcon } from "lucide-react";

/**
 * Props de {@link ChartDataTable}.
 * @interface ChartDataTableProps
 * @property {ChartSeries[]} series - Las mismas series que pinta el gráfico
 * @property {string[]} categories - Las mismas categorías, en el mismo orden
 * @property {string} caption - Descripción del gráfico, que hace de subtítulo del panel
 * @property {boolean} [isShare] - Si el gráfico reparte un total (tarta, anillo), que cambia el nombre de la primera columna
 * @property {(value: number) => string} [formatValue] - Cómo se escribe un valor; sin ella, el número tal cual
 * @property {(index: number) => void} [onSelect] - Si se pasa, el nombre de cada fila se convierte en un botón que lleva al recurso de esa categoría. **Es la vía accesible del gráfico pulsable**: el lienzo es un mapa de píxeles y no se puede tabular, así que sin esto la navegación dependería de acertarle a un pétalo con el ratón
 */
interface ChartDataTableProps {
  series: ChartSeries[];
  categories: string[];
  caption: string;
  isShare?: boolean;
  formatValue?: (value: number) => string;
  onSelect?: (index: number) => void;
}

/**
 * Los datos de un gráfico, en una tabla dentro de un panel lateral.
 *
 * **No es un extra.** Un lienzo es un mapa de píxeles: un lector de pantalla no lee una línea, y
 * quien no distingue dos colores tampoco sabe cuál es cuál aunque vea el dibujo perfectamente. Esta
 * tabla es la misma información sin depender ni de la vista ni del color. Y sirve para algo más
 * mundano: un gráfico enseña la forma, no la cifra, y a veces lo que hace falta es la cifra.
 *
 * En un panel lateral y no plegada bajo el gráfico: doce meses por dos series son doce filas, y
 * desplegarlas dentro de la tarjeta empujaba media pantalla hacia abajo cada vez que alguien las
 * abría. En el panel caben enteras y sin mover nada de sitio.
 *
 * Tres cosas que la hacen legible y no un volcado:
 *
 * - **Cada serie lleva su color** en la cabecera, el mismo con el que se pintó. Es lo que permite
 *   pasar del dibujo a la tabla sin perder cuál era cuál.
 * - **Los números van a la derecha y con cifras de ancho fijo**, que es como se compara una columna
 *   de importes de un vistazo: alineados, las unidades caen unas debajo de otras.
 * - **La última fila es el total** de cada serie. Es la pregunta que se hace justo después de mirar
 *   un gráfico de doce meses, y tenerla que sumar a mano invita a equivocarse.
 * @param {ChartDataTableProps} props - Propiedades de la tabla
 * @returns {JSX.Element} El disparador y su panel
 */
export default function ChartDataTable({
  series,
  categories,
  caption,
  isShare,
  formatValue,
  onSelect,
}: ChartDataTableProps) {
  const t = useTranslations("Common.Chart");
  const { resolvedTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  /*
   * La paleta se lee del documento, igual que la del gráfico y del mismo sitio.
   *
   * Tiene que ser **la misma**: la muestra de color de esta cabecera es lo único que permite pasar
   * del dibujo a la tabla sabiendo cuál era cuál. Leerla de otro lado sería tener dos verdades.
   *
   * Se espera a estar montado porque en el servidor no hay variables CSS que consultar, y se
   * vuelve a leer al cambiar de tema: dentro de `.dark` los valores son otros.
   */
  const isMounted = useIsMounted();
  const palette = useMemo(
    () =>
      isMounted ? seriesPalette(readChartTheme()?.palette ?? [], Boolean(isShare)) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `resolvedTheme` no se usa dentro, pero es lo que cambia los valores que se leen del documento
    [isMounted, resolvedTheme, isShare],
  );

  const write = (value: number) => (formatValue ? formatValue(value) : String(value));

  /*
   * Los totales se suman aquí y no llegan calculados: el gráfico ya tiene los datos y sumarlos es
   * una línea, mientras que pedírselos a quien lo usa obligaría a cada tarjeta del panel a hacer
   * su propia suma y a arriesgarse a que no cuadre con lo que enseña la tabla.
   */
  const totals = series.map((serie) => serie.data.reduce((sum, value) => sum + (value ?? 0), 0));

  return (
    <>
      {/*
        Texto con su icono y no un botón con marco: es un apoyo del gráfico, no una acción de la
        tarjeta, y con marco competía con el propio gráfico por la atención.
      */}
      <button type="button" className="chart__table__trigger" onClick={() => setIsOpen(true)}>
        <InfoIcon aria-hidden="true" />
        {t("showTable")}
      </button>

      {/*
        En un modal ancho y no en un panel lateral, que es lo que usa la intranet: aquí no hay `SideModal`,
        y no se trae uno solo para esto —tener dos ideas de «ventana encima» en la misma aplicación es peor
        que tener una—. La tabla necesita ancho, así que va en `isLarge`.
      */}
      <ModalComponent
        isLarge
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t("tableTitle")}
      >
        <div className="chart__table__panel">
          <header className="chart__table__head">
            <p className="chart__table__subject">{caption}</p>
            <p className="chart__table__intro">{t("tableIntro")}</p>
          </header>

          <div className="chart__table__scroll">
            <table className="chart__table">
              <thead>
                <tr>
                  {/* «Periodo» solo vale si el eje es tiempo; en un reparto las filas son
                      conceptos —servicios, estados—, no meses. */}
                  <th scope="col">{isShare ? t("item") : t("category")}</th>
                  {series.map((serie, index) => (
                    <th key={serie.name} scope="col" className="chart__table__value">
                      <span className="chart__table__serie">
                        {/* Antes del primer efecto no hay paleta leída todavía; la muestra se
                            queda sin pintar en vez de salir de un color inventado. */}
                        {palette.length > 0 && (
                          <span
                            className="chart__table__swatch"
                            style={{ backgroundColor: palette[index % palette.length] }}
                            aria-hidden="true"
                          />
                        )}
                        {serie.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {categories.map((category, index) => (
                  <tr key={category}>
                    {/*
                      Con `onSelect`, el nombre de la fila es el enlace al recurso.

                      Es la vía por teclado del gráfico pulsable: el lienzo es un mapa de píxeles con
                      `role="img"` y no se puede tabular, así que si la navegación viviera solo en el
                      clic del pétalo, quien no usa ratón se quedaría sin ella. Al cerrar el panel se
                      navega, así que no hace falta cerrarlo a mano.
                    */}
                    <th scope="row">
                      {onSelect ? (
                        <button
                          type="button"
                          className="chart__table__link"
                          onClick={() => onSelect(index)}
                        >
                          {category}
                        </button>
                      ) : (
                        category
                      )}
                    </th>
                    {series.map((serie) => (
                      <td key={serie.name} className="chart__table__value">
                        {write(serie.data[index] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <th scope="row">{t("tableTotal")}</th>
                  {totals.map((total, index) => (
                    <td key={series[index]?.name ?? index} className="chart__table__value">
                      {write(total)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="chart__table__count">{t("tableRows", { count: categories.length })}</p>
        </div>
      </ModalComponent>
    </>
  );
}
