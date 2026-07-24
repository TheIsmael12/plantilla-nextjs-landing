import type {
  DateIndicator,
  DateInputValue,
} from "@/types/ui/inputs/date-picker";

/**
 * Colores por defecto asignados a los indicadores del calendario cuando no
 * se indica `color`, en el orden en que aparecen en la prop `indicators`.
 */
const DEFAULT_INDICATOR_COLORS: string[] = [
  "var(--primary-color)",
  "var(--info-color)",
  "var(--warning-color)",
  "var(--success-color)",
  "var(--danger-color)",
];

/**
 * Restricciones de fecha combinables usadas para determinar qué días están
 * deshabilitados en el calendario de `DatePicker` y `DateRangePicker`.
 * @interface DateConstraints
 * @property {DateInputValue} [minDate] - Fecha mínima seleccionable
 * @property {DateInputValue} [maxDate] - Fecha máxima seleccionable
 * @property {boolean} [disablePast] - Deshabilita fechas anteriores a hoy
 * @property {boolean} [disableFuture] - Deshabilita fechas posteriores a hoy
 * @property {boolean} [disableToday] - Deshabilita también hoy
 * @property {(date: Date) => boolean} [disabledDates] - Predicado para deshabilitar fechas concretas
 */
export interface DateConstraints {
  minDate?: DateInputValue;
  maxDate?: DateInputValue;
  disablePast?: boolean;
  disableFuture?: boolean;
  disableToday?: boolean;
  disabledDates?: (date: Date) => boolean;
}

/**
 * Día de la rejilla mensual generada por {@link getCalendarMatrix}, indicando
 * si pertenece al mes visible o es relleno de la semana previa/siguiente.
 * @interface CalendarDay
 * @property {Date} date - Fecha representada por la celda
 * @property {boolean} isCurrentMonth - `true` si `date` pertenece al mes solicitado
 */
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

/**
 * Suma (o resta) un número de días a una fecha, sin mutar la fecha original.
 * @param {Date} date - Fecha de partida
 * @param {number} offset - Número de días a sumar (negativo para restar)
 * @returns {Date} Nueva fecha desplazada
 */
function addDays(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
}

/**
 * Suma (o resta) meses a una fecha, ajustando el día si el mes destino tiene
 * menos días (p. ej. 31 de enero + 1 mes → 28/29 de febrero).
 * @param {Date} date - Fecha de partida
 * @param {number} offset - Número de meses a sumar (negativo para restar)
 * @returns {Date} Nueva fecha desplazada, con el día ajustado al mes destino
 */
function addMonthsClampDay(date: Date, offset: number): Date {
  const targetMonth = date.getMonth() + offset;
  const lastDayOfTargetMonth = new Date(
    date.getFullYear(),
    targetMonth + 1,
    0,
  ).getDate();
  return new Date(
    date.getFullYear(),
    targetMonth,
    Math.min(date.getDate(), lastDayOfTargetMonth),
  );
}

/**
 * Suma (o resta) años a una fecha, ajustando el día si el mes destino tiene
 * menos días (p. ej. 29 de febrero de un año bisiesto + 1 año).
 * @param {Date} date - Fecha de partida
 * @param {number} offset - Número de años a sumar (negativo para restar)
 * @returns {Date} Nueva fecha desplazada, con el día ajustado al mes destino
 */
function addYears(date: Date, offset: number): Date {
  const lastDayOfTargetMonth = new Date(
    date.getFullYear() + offset,
    date.getMonth() + 1,
    0,
  ).getDate();
  return new Date(
    date.getFullYear() + offset,
    date.getMonth(),
    Math.min(date.getDate(), lastDayOfTargetMonth),
  );
}

/**
 * Normaliza un valor de fecha aceptado por los inputs de fecha (`Date` nativo
 * o cadena "YYYY-MM-DD") a un `Date` a medianoche en hora local, sin depender
 * de ninguna librería externa de fechas.
 * @param {(DateInputValue|null)} [value] - Valor a normalizar
 * @returns {(Date|null)} La fecha normalizada, o `null` si `value` es `null`/`undefined`/inválido
 */
export function toDateOrNull(value?: DateInputValue | null): Date | null {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

/**
 * Trunca una fecha a medianoche en hora local, descartando la hora.
 * @param {Date} date - Fecha de partida
 * @returns {Date} Nueva fecha a las 00:00 del mismo día
 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Trunca una fecha al primer día del mes, a medianoche en hora local.
 * @param {Date} date - Fecha de partida
 * @returns {Date} Nueva fecha correspondiente al día 1 del mismo mes
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Avanza (o retrocede) una fecha un número de meses completos, manteniendo
 * el resultado en el día 1 del mes destino (uso pensado para fechas "vista
 * de mes" ya truncadas con {@link startOfMonth}).
 * @param {Date} date - Fecha de partida
 * @param {number} offset - Número de meses a sumar (negativo para restar)
 * @returns {Date} Nueva fecha en el día 1 del mes desplazado
 */
export function addMonths(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

/**
 * Comprueba si dos fechas corresponden al mismo día en hora local, ignorando la hora.
 * @param {Date} a - Primera fecha a comparar
 * @param {Date} b - Segunda fecha a comparar
 * @returns {boolean} `true` si `a` y `b` son el mismo día
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Comprueba si una fecha es estrictamente anterior a otra, comparando solo el día.
 * @param {Date} a - Fecha a comprobar
 * @param {Date} b - Fecha de referencia
 * @returns {boolean} `true` si `a` es anterior a `b`
 */
export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

/**
 * Calcula el número de noches (días completos) entre dos fechas.
 * @param {Date} start - Fecha de inicio del rango
 * @param {Date} end - Fecha de fin del rango
 * @returns {number} Número de días completos entre `start` y `end`
 */
export function daysBetween(start: Date, end: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / MS_PER_DAY,
  );
}

/**
 * Comprueba si una fecha cae dentro de un rango (inclusive), sin asumir que
 * `start` sea anterior a `end`.
 * @param {Date} date - Fecha a comprobar
 * @param {Date} start - Un extremo del rango
 * @param {Date} end - El otro extremo del rango
 * @returns {boolean} `true` si `date` está entre `start` y `end` (en cualquier orden), inclusive
 */
export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const day = startOfDay(date).getTime();
  const from = startOfDay(start).getTime();
  const to = startOfDay(end).getTime();
  const [lower, upper] = from <= to ? [from, to] : [to, from];
  return day >= lower && day <= upper;
}

/**
 * Genera la clave estable usada para indexar referencias DOM y comparar días
 * en atributos `data-date`, en formato `"AAAA-M-D"` (mes 0-indexado).
 * @param {Date} date - Fecha a partir de la cual generar la clave
 * @returns {string} Clave única del día en formato `"AAAA-M-D"`
 */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Formatea una fecha en formato corto localizado (día/mes/año), usado como
 * texto visible del trigger de `DatePicker`/`DateRangePicker`.
 * @param {Date} date - Fecha a formatear
 * @param {string} locale - Locale usado para el formato (`useLocale()` de next-intl)
 * @returns {string} La fecha formateada según el locale indicado
 */
export function formatShortDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formatea el nombre del mes y el año de una fecha, usado como cabecera de
 * cada mes del calendario.
 * @param {Date} date - Fecha (cualquier día) del mes a etiquetar
 * @param {string} locale - Locale usado para el formato (`useLocale()` de next-intl)
 * @returns {string} El nombre del mes y el año formateados según el locale indicado
 */
export function getMonthLabel(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

/**
 * Genera las etiquetas cortas de los 7 días de la semana, en el orden que
 * corresponde según `firstDayOfWeek`.
 * @param {string} locale - Locale usado para el formato (`useLocale()` de next-intl)
 * @param {(0|1)} firstDayOfWeek - Primer día de la semana (0 = domingo, 1 = lunes)
 * @returns {string[]} Las 7 etiquetas de día, empezando por `firstDayOfWeek`
 */
export function getWeekdayLabels(
  locale: string,
  firstDayOfWeek: 0 | 1,
): string[] {
  // 2023-01-01 es domingo; se usa como semana de referencia para formatear
  // cada día de la semana sin depender de una librería externa de fechas.
  const referenceSunday = new Date(2023, 0, 1);
  const labels: string[] = [];

  for (let i = 0; i < 7; i++) {
    const dayIndex = (firstDayOfWeek + i) % 7;
    const date = addDays(referenceSunday, dayIndex);
    labels.push(date.toLocaleDateString(locale, { weekday: "short" }));
  }

  return labels;
}

/**
 * Genera la rejilla completa (6 semanas fijas, 42 celdas) de un mes,
 * incluyendo los días de relleno del mes anterior/siguiente necesarios para
 * completar semanas enteras según `firstDayOfWeek`.
 * @param {number} year - Año del mes a representar
 * @param {number} month - Mes a representar (0 = enero)
 * @param {(0|1)} firstDayOfWeek - Primer día de la semana (0 = domingo, 1 = lunes)
 * @returns {CalendarDay[]} Las 42 celdas de la rejilla, en orden cronológico
 */
export function getCalendarMatrix(
  year: number,
  month: number,
  firstDayOfWeek: 0 | 1,
): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const leadingDays = (firstOfMonth.getDay() - firstDayOfWeek + 7) % 7;
  const gridStart = addDays(firstOfMonth, -leadingDays);

  // 6 semanas fijas para evitar saltos de altura entre meses con distinto número de semanas
  const TOTAL_CELLS = 42;
  const days: CalendarDay[] = [];

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const date = addDays(gridStart, i);
    days.push({ date, isCurrentMonth: date.getMonth() === month });
  }

  return days;
}

/**
 * Comprueba si una fecha está deshabilitada según el conjunto combinado de
 * restricciones (rango min/max, pasado/futuro/hoy, predicado de fechas concretas).
 * @param {Date} date - Fecha a comprobar
 * @param {DateConstraints} constraints - Restricciones activas del calendario
 * @returns {boolean} `true` si alguna restricción deshabilita `date`
 */
export function isDateDisabled(
  date: Date,
  constraints: DateConstraints,
): boolean {
  const day = startOfDay(date);
  const today = startOfDay(new Date());
  const min = toDateOrNull(constraints.minDate ?? null);
  const max = toDateOrNull(constraints.maxDate ?? null);

  if (min && day.getTime() < min.getTime()) return true;
  if (max && day.getTime() > max.getTime()) return true;
  if (constraints.disablePast && day.getTime() < today.getTime()) return true;
  if (constraints.disableFuture && day.getTime() > today.getTime()) return true;
  if (constraints.disableToday && day.getTime() === today.getTime()) return true;
  if (constraints.disabledDates?.(day)) return true;

  return false;
}

/**
 * Comprueba si el botón de "mes anterior" debe deshabilitarse, porque el
 * último día del mes previo ya cae por debajo de `minDate`.
 * @param {Date} viewDate - Primer día del mes actualmente visible
 * @param {DateConstraints} constraints - Restricciones activas del calendario
 * @returns {boolean} `true` si no queda ningún día seleccionable en el mes anterior
 */
export function isPrevMonthDisabled(
  viewDate: Date,
  constraints: DateConstraints,
): boolean {
  const min = toDateOrNull(constraints.minDate ?? null);
  if (!min) return false;

  const lastDayOfPrevMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    0,
  );
  return lastDayOfPrevMonth.getTime() < min.getTime();
}

/**
 * Comprueba si el botón de "mes siguiente" debe deshabilitarse, porque el
 * primer día del mes siguiente ya supera `maxDate`.
 * @param {Date} viewDate - Primer día del mes actualmente visible
 * @param {DateConstraints} constraints - Restricciones activas del calendario
 * @returns {boolean} `true` si no queda ningún día seleccionable en el mes siguiente
 */
export function isNextMonthDisabled(
  viewDate: Date,
  constraints: DateConstraints,
): boolean {
  const max = toDateOrNull(constraints.maxDate ?? null);
  if (!max) return false;

  const firstDayOfNextMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    1,
  );
  return firstDayOfNextMonth.getTime() > max.getTime();
}

/**
 * Calcula la siguiente fecha con foco de teclado tras pulsar una tecla de
 * navegación dentro de la rejilla del calendario (flechas, Home/End, PageUp/PageDown).
 * @param {Date} date - Fecha actualmente enfocada
 * @param {string} key - Tecla pulsada (`event.key`)
 * @param {(0|1)} firstDayOfWeek - Primer día de la semana (0 = domingo, 1 = lunes), usado por Home/End
 * @param {boolean} shiftKey - Si `Shift` estaba pulsado a la vez (PageUp/PageDown saltan de año en vez de mes)
 * @returns {(Date|null)} La nueva fecha a enfocar, o `null` si la tecla no representa una navegación soportada
 */
export function getNextFocusedDate(
  date: Date,
  key: string,
  firstDayOfWeek: 0 | 1,
  shiftKey: boolean,
): Date | null {
  switch (key) {
    case "ArrowLeft":
      return addDays(date, -1);
    case "ArrowRight":
      return addDays(date, 1);
    case "ArrowUp":
      return addDays(date, -7);
    case "ArrowDown":
      return addDays(date, 7);
    case "Home": {
      const offsetFromWeekStart = (date.getDay() - firstDayOfWeek + 7) % 7;
      return addDays(date, -offsetFromWeekStart);
    }
    case "End": {
      const offsetToWeekEnd = (firstDayOfWeek + 6 - date.getDay() + 7) % 7;
      return addDays(date, offsetToWeekEnd);
    }
    case "PageUp":
      return shiftKey ? addYears(date, -1) : addMonthsClampDay(date, -1);
    case "PageDown":
      return shiftKey ? addYears(date, 1) : addMonthsClampDay(date, 1);
    default:
      return null;
  }
}

/**
 * Resuelve el color de un indicador del calendario: el explícito de
 * `indicator.color`, o uno por defecto asignado cíclicamente según su
 * posición en la lista de `indicators`.
 * @param {number} index - Posición del indicador dentro de la lista `indicators`
 * @param {string} [color] - Color CSS explícito del indicador, si se indicó
 * @returns {string} El color CSS a aplicar al punto del indicador
 */
export function resolveIndicatorColor(index: number, color?: string): string {
  if (color) return color;

  const paletteIndex = index % DEFAULT_INDICATOR_COLORS.length;
  // paletteIndex siempre cae dentro de [0, DEFAULT_INDICATOR_COLORS.length - 1] por construcción
  return DEFAULT_INDICATOR_COLORS[paletteIndex] as string;
}

/**
 * Calcula los colores de los indicadores activos para un día concreto,
 * comparando `date` contra las fechas de cada indicador de `indicators`.
 * @param {Date} date - Día a comprobar
 * @param {DateIndicator[]} [indicators] - Indicadores configurados en el calendario
 * @returns {string[]} Los colores (ya resueltos) de los indicadores que incluyen `date`, en el mismo orden que `indicators`
 */
export function getIndicatorColorsForDay(
  date: Date,
  indicators?: DateIndicator[],
): string[] {
  if (!indicators || indicators.length === 0) return [];

  const colors: string[] = [];

  indicators.forEach((indicator, index) => {
    const matchesDay = indicator.dates.some((candidate) => {
      const candidateDate = toDateOrNull(candidate);
      return candidateDate ? isSameDay(candidateDate, date) : false;
    });

    if (matchesDay) colors.push(resolveIndicatorColor(index, indicator.color));
  });

  return colors;
}
