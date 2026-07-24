import type { KeyboardEvent } from "react";

/**
 * Props de {@link DateCalendarMonth}.
 * @interface DateCalendarMonthProps
 * @property {number} year - Año del mes representado en la rejilla
 * @property {number} month - Mes representado en la rejilla (0 = enero)
 * @property {string} locale - Locale usado para formatear el nombre del mes, los días de la semana y los `aria-label` de cada día
 * @property {(0|1)} firstDayOfWeek - Primer día de la semana (0 = domingo, 1 = lunes)
 * @property {(Date|null)} focusedDate - Fecha con foco de teclado actual, si la hay
 * @property {string} gridLabelId - Id del elemento que describe la rejilla (`aria-labelledby`)
 * @property {(date: Date) => boolean} isDisabled - Predicado que indica si un día está deshabilitado
 * @property {(date: Date) => boolean} isSelected - Predicado que indica si un día es la fecha seleccionada (DatePicker)
 * @property {(date: Date) => boolean} [isRangeStart] - Predicado que indica si un día es el inicio de un rango (DateRangePicker)
 * @property {(date: Date) => boolean} [isRangeEnd] - Predicado que indica si un día es el fin de un rango (DateRangePicker)
 * @property {(date: Date) => boolean} [isInRange] - Predicado que indica si un día está dentro de un rango (DateRangePicker)
 * @property {(date: Date) => string[]} [getDayIndicatorColors] - Devuelve los colores de los indicadores activos en un día
 * @property {(date: Date) => void} onSelectDay - Handler de selección de un día
 * @property {(date: Date) => void} [onHoverDay] - Handler de hover sobre un día, usado para previsualizar un rango
 * @property {(date: Date) => void} onFocusDay - Handler de foco de un día
 * @property {(event: KeyboardEvent<HTMLButtonElement>, date: Date) => void} onKeyDownDay - Handler de teclado sobre un día
 * @property {(key: string, el: HTMLButtonElement | null) => void} registerDayRef - Registra/desregistra la referencia DOM de un día, indexada por su `dateKey`
 */
export interface DateCalendarMonthProps {
  year: number;
  month: number;
  locale: string;
  firstDayOfWeek: 0 | 1;
  focusedDate: Date | null;
  gridLabelId: string;
  isDisabled: (date: Date) => boolean;
  isSelected: (date: Date) => boolean;
  isRangeStart?: (date: Date) => boolean;
  isRangeEnd?: (date: Date) => boolean;
  isInRange?: (date: Date) => boolean;
  getDayIndicatorColors?: (date: Date) => string[];
  onSelectDay: (date: Date) => void;
  onHoverDay?: (date: Date) => void;
  onFocusDay: (date: Date) => void;
  onKeyDownDay: (event: KeyboardEvent<HTMLButtonElement>, date: Date) => void;
  registerDayRef: (key: string, el: HTMLButtonElement | null) => void;
}
