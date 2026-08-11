"use client";

import "@/styles/04-components/ui/files/csv-preview.scss";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { parseCsv } from "@/utils/fileUtils";

import Spinner from "@/components/ui/loaders/Spinner";

import type { CsvPreviewProps } from "@/types/ui/files/csv-preview";

/** Celda seleccionada, en coordenadas de hoja de cálculo: fila 1 es la primera línea del fichero. */
interface SelectedCell {
  row: number;
  column: number;
  value: string;
}

/**
 * Columnas mínimas que se pintan aunque el fichero tenga menos: una hoja de
 * cálculo no termina donde acaban los datos, sigue con columnas vacías hasta
 * el borde. Sin esto la rejilla se cortaría a media pantalla.
 */
const MIN_COLUMNS = 16;

/** Filas mínimas que se pintan, por el mismo motivo que {@link MIN_COLUMNS}. */
const MIN_ROWS = 24;

/**
 * Nombre de columna de hoja de cálculo para una posición (0 → `A`, 25 → `Z`,
 * 26 → `AA`...), como en Excel.
 * @param {number} index - Posición de la columna, empezando en 0
 * @returns {string} La letra (o letras) de la columna
 */
function columnLetter(index: number): string {
  let letter = "";
  let remaining = index;

  do {
    letter = String.fromCharCode(65 + (remaining % 26)) + letter;
    remaining = Math.floor(remaining / 26) - 1;
  } while (remaining >= 0);

  return letter;
}

/**
 * Indica si una celda es un número en formato español (miles con punto,
 * decimales con coma, signo opcional), para alinearla a la derecha — que es lo
 * que hace una hoja de cálculo con los valores numéricos.
 * @param {string} value - Contenido de la celda
 * @returns {boolean} `true` si la celda es un número
 */
function isNumeric(value: string): boolean {
  return /^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+([.,]\d+)?$/.test(value);
}

/**
 * Vista previa de un CSV con aspecto de hoja de cálculo, usada por
 * {@link FileViewer}: descarga el fichero, lo parsea con {@link parseCsv} y lo
 * pinta como una hoja de Excel — letras de columna, números de fila, rejilla,
 * primera fila fija como cabecera, celda seleccionable con su referencia y su
 * contenido en la barra superior, y pestaña de hoja abajo con el recuento.
 *
 * Descarga el fichero él mismo en vez de recibir el texto ya resuelto porque un
 * CSV solo se lee cuando el usuario abre el visor: cargarlo antes obligaría a
 * que la lista pidiera todos sus adjuntos de golpe.
 *
 * La selección se mueve solo con el ratón, a propósito: el visor que lo
 * contiene ya usa las flechas del teclado para cambiar de fichero, y competir
 * por esas teclas dejaría al usuario sin poder pasar al adjunto siguiente.
 * @param {CsvPreviewProps} props - Propiedades de la vista previa
 * @returns {JSX.Element} La hoja del CSV, o su estado de carga/error
 */
export default function CsvPreview({ url, name }: CsvPreviewProps) {
  const t = useTranslations("Common.FileViewer");

  const [rows, setRows] = useState<string[][] | null>(null);
  const [hasError, setHasError] = useState(false);
  const [selected, setSelected] = useState<SelectedCell | null>(null);

  useEffect(() => {
    let cancelled = false;

    // El `setState` va en el `.then` (nunca síncrono en el cuerpo del efecto),
    // mismo criterio que `AsyncSelectSearch`.
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        return response.text();
      })
      .then((content) => {
        if (!cancelled) setRows(parseCsv(content));
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (hasError) {
    return (
      <div className="csv-preview csv-preview--message">
        <p className="csv-preview__error">{t("csvError", { fileName: name })}</p>
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="csv-preview csv-preview--message">
        <Spinner />
      </div>
    );
  }

  const [header, ...body] = rows;

  if (!header) {
    return (
      <div className="csv-preview csv-preview--message">
        <p>{t("csvEmpty", { fileName: name })}</p>
      </div>
    );
  }

  // Una fila corta no debe descuadrar la rejilla: todas se pintan con tantas
  // columnas como la más ancha, rellenando con celdas vacías, y la hoja
  // continúa con filas y columnas de sobra más allá de los datos.
  const dataColumnCount = rows.reduce((widest, cells) => Math.max(widest, cells.length), 0);
  const columns = Array.from(
    { length: Math.max(dataColumnCount, MIN_COLUMNS) },
    (_, index) => index,
  );
  const bodyRows = Array.from(
    { length: Math.max(body.length, MIN_ROWS - 1) },
    (_, index) => body[index] ?? [],
  );

  // Como en Excel, al abrir siempre hay una celda activa: A1.
  const activeCell = selected ?? { row: 1, column: 0, value: header[0] ?? "" };

  const cellClassName = (row: number, column: number, value: string) =>
    [
      isNumeric(value) ? "csv-preview__cell--numeric" : "",
      activeCell.row === row && activeCell.column === column
        ? "csv-preview__cell--selected"
        : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const headerClassName = (column: number) =>
    `csv-preview__column-header${
      activeCell.column === column ? " csv-preview__column-header--active" : ""
    }`;

  const rowNumberClassName = (row: number) =>
    `csv-preview__row-number${
      activeCell.row === row ? " csv-preview__row-number--active" : ""
    }`;

  return (
    <div className="csv-preview">
      {/* Barra superior: cuadro de nombre + contenido de la celda, como Excel */}
      <div className="csv-preview__bar">
        <span className="csv-preview__name-box">
          {`${columnLetter(activeCell.column)}${activeCell.row}`}
        </span>
        <span className="csv-preview__formula">{activeCell.value}</span>
      </div>

      {/* La rejilla desborda en ambos ejes: región enfocable para poder
          desplazarla solo con el teclado (`scrollable-region-focusable`) */}
      <div className="csv-preview__grid" role="region" aria-label={name} tabIndex={0}>
        <table className="csv-preview__table">
          <caption className="sr-only">{name}</caption>

          <thead>
            {/* Letras de columna: son el "cromo" de la hoja, no cabeceras
                reales — las de verdad son los nombres de la primera fila */}
            <tr className="csv-preview__letters" aria-hidden="true">
              <td className="csv-preview__corner" />
              {columns.map((column) => (
                <td key={column} className={headerClassName(column)}>
                  {columnLetter(column)}
                </td>
              ))}
            </tr>

            <tr>
              <td className={rowNumberClassName(1)} aria-hidden="true">
                1
              </td>
              {columns.map((column) => {
                const value = header[column] ?? "";

                // Las columnas que el fichero no trae son hoja vacía, no
                // cabeceras: un `<th>` sin texto no nombra nada.
                if (!value) {
                  return (
                    <td
                      key={column}
                      className={cellClassName(1, column, value)}
                      onClick={() => setSelected({ row: 1, column, value })}
                    />
                  );
                }

                return (
                  <th
                    key={column}
                    scope="col"
                    className={cellClassName(1, column, value)}
                    onClick={() => setSelected({ row: 1, column, value })}
                  >
                    {value}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {bodyRows.map((cells, index) => {
              const row = index + 2;

              return (
                <tr key={row}>
                  <td className={rowNumberClassName(row)} aria-hidden="true">
                    {row}
                  </td>
                  {columns.map((column) => {
                    const value = cells[column] ?? "";

                    return (
                      <td
                        key={column}
                        className={cellClassName(row, column, value)}
                        onClick={() => setSelected({ row, column, value })}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pie: pestaña de hoja con el nombre del fichero + recuento */}
      <div className="csv-preview__footer">
        <span className="csv-preview__sheet-tab">{name}</span>

        {/* El recuento es de datos reales, no de la hoja pintada */}
        <span className="csv-preview__count">
          <span>{t("csvRows", { count: body.length })}</span>
          <span>{t("csvColumns", { count: dataColumnCount })}</span>
        </span>
      </div>
    </div>
  );
}
