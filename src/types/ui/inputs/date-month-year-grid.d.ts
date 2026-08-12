/**
 * Qué rejilla muestra {@link DateMonthYearGrid}.
 * @typedef {("months"|"years")} DateMonthYearGridMode
 */
export type DateMonthYearGridMode = "months" | "years";

/**
 * Props de {@link DateMonthYearGrid}: la vista de salto rápido que sustituye a la rejilla de días
 * mientras está activa, para moverse muchos meses o años de un vistazo en vez de mes a mes.
 * @interface DateMonthYearGridProps
 * @property {DateMonthYearGridMode} mode - Si la rejilla lista los 12 meses del año visible, o los 12 años del tramo de década visible
 * @property {number} year - Año de referencia: el que se lista en modo "months", o el que sitúa el tramo de doce en modo "years"
 * @property {number} [month] - Mes actualmente elegido (0 = enero), para resaltarlo en modo "months"
 * @property {string} locale - Locale usado para los nombres de mes (`useLocale()` de next-intl)
 * @property {string} ariaLabel - Nombre accesible de la rejilla, ya resuelto (p. ej. "Elegir mes de 2026")
 * @property {(month: number) => boolean} isMonthDisabled - Predicado que indica si un mes completo cae fuera de rango (solo en modo "months")
 * @property {(year: number) => boolean} isYearDisabled - Predicado que indica si un año completo cae fuera de rango (solo en modo "years")
 * @property {(month: number) => void} onSelectMonth - Handler de selección de un mes
 * @property {(year: number) => void} onSelectYear - Handler de selección de un año
 */
export interface DateMonthYearGridProps {
  mode: DateMonthYearGridMode;
  year: number;
  month?: number;
  locale: string;
  ariaLabel: string;
  isMonthDisabled: (month: number) => boolean;
  isYearDisabled: (year: number) => boolean;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
}
