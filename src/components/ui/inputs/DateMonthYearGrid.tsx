"use client";

import type { DateMonthYearGridProps } from "@/types/ui/inputs/date-month-year-grid";
import { getDecadeStart, getMonthGridLabels } from "@/utils/dateUtils";

/**
 * Vista de salto rápido de mes o año, que sustituye a la rejilla de días de {@link DateCalendarMonth}
 * mientras está activa: 12 celdas en 3x4, mismo ancho que el calendario para que el panel no cambie
 * de tamaño al entrar o salir de ella.
 *
 * En modo "years" lista un tramo fijo de doce años ({@link getDecadeStart}), no la década civil: lo
 * único que importa es que sea un tramo estable y navegable de doce en doce, igual que los doce meses
 * del otro modo — así los dos modos comparten exactamente la misma rejilla y la misma lógica de "anterior/siguiente".
 * @param {DateMonthYearGridProps} props - Propiedades del componente
 * @returns {JSX.Element} La rejilla de meses o años renderizada
 */
export default function DateMonthYearGrid({
  mode,
  year,
  month,
  locale,
  ariaLabel,
  isMonthDisabled,
  isYearDisabled,
  onSelectMonth,
  onSelectYear,
}: DateMonthYearGridProps) {
  if (mode === "months") {
    const monthLabels = getMonthGridLabels(locale);

    return (
      <div role="grid" aria-label={ariaLabel} className="date-month-year-grid">
        {monthLabels.map((label, index) => {
          const disabled = isMonthDisabled(index);
          const selected = index === month;

          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-selected={selected}
              className={`date-month-year-grid__cell${
                selected ? " date-month-year-grid__cell--selected" : ""
              }`}
              onClick={() => onSelectMonth(index)}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  const decadeStart = getDecadeStart(year);
  const years = Array.from({ length: 12 }, (_, index) => decadeStart + index);

  return (
    <div role="grid" aria-label={ariaLabel} className="date-month-year-grid">
      {years.map((yearOption) => {
        const disabled = isYearDisabled(yearOption);
        const selected = yearOption === year;

        return (
          <button
            key={yearOption}
            type="button"
            role="gridcell"
            disabled={disabled}
            aria-selected={selected}
            className={`date-month-year-grid__cell${
              selected ? " date-month-year-grid__cell--selected" : ""
            }`}
            onClick={() => onSelectYear(yearOption)}
          >
            {yearOption}
          </button>
        );
      })}
    </div>
  );
}
