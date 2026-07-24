import type { DateIndicator, DateInputValue } from "@/types/ui/inputs/date-picker";

/**
 * Rango de fechas aceptado como valor de {@link DateRangePicker}. Cada extremo
 * admite un `Date` nativo, una cadena "YYYY-MM-DD" o `null` si aún no se ha elegido.
 * @interface DateRangeValue
 * @property {(DateInputValue|null)} startDate - Fecha de inicio del rango
 * @property {(DateInputValue|null)} endDate - Fecha de fin del rango
 */
export interface DateRangeValue {
  startDate: DateInputValue | null;
  endDate: DateInputValue | null;
}

/**
 * Rango de fechas normalizado que recibe `onChange`, siempre con `Date` nativos o `null`.
 * @interface NormalizedDateRange
 * @property {(Date|null)} startDate - Fecha de inicio del rango, ya normalizada
 * @property {(Date|null)} endDate - Fecha de fin del rango, ya normalizada
 */
export interface NormalizedDateRange {
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Tamaños soportados por {@link DateRangePicker}.
 * @typedef {("sm"|"md")} DateRangePickerSize
 */
export type DateRangePickerSize = "sm" | "md";

/**
 * Props de {@link DateRangePicker}.
 * @interface DateRangePickerProps
 * @property {string} [id] - Id del trigger, usado para asociar el `label` y el panel del calendario
 * @property {string} [name] - Prefijo de nombre de los inputs ocultos (`${name}Start` / `${name}End`), usado por Formik
 * @property {string} [label] - Etiqueta visible encima del campo
 * @property {string} [placeholder] - Texto mostrado cuando no hay rango seleccionado; por defecto la clave `Common.DatePicker.selectDateRange`
 * @property {DateRangeValue} value - Rango seleccionado actualmente (prop controlada)
 * @property {(value: NormalizedDateRange) => void} onChange - Handler invocado con el rango elegido, ya normalizado a `Date`/`null`
 * @property {boolean} [required] - Marca el campo como obligatorio y pinta un asterisco junto al label
 * @property {boolean} [disabled] - Deshabilita el campo e impide abrir el calendario
 * @property {boolean} [clearable] - Muestra un botón para limpiar el rango seleccionado
 * @property {string} [error] - Clave de traducción (namespace `Validations`) del error de Yup/servidor; solo se pinta si `touched` es `true`
 * @property {boolean} [touched] - Si el campo ha sido interactuado; controla cuándo se muestra `error`
 * @property {DateRangePickerSize} [size] - Tamaño visual del campo; por defecto "md"
 * @property {string} [className] - Clases CSS adicionales del contenedor
 * @property {(0|1)} [firstDayOfWeek] - Primer día de la semana del calendario (0 = domingo, 1 = lunes); por defecto 1
 * @property {DateInputValue} [minDate] - Fecha mínima seleccionable
 * @property {DateInputValue} [maxDate] - Fecha máxima seleccionable
 * @property {boolean} [disablePast] - Deshabilita fechas anteriores a hoy
 * @property {boolean} [disableFuture] - Deshabilita fechas posteriores a hoy
 * @property {boolean} [disableToday] - Deshabilita también hoy
 * @property {(date: Date) => boolean} [disabledDates] - Predicado para deshabilitar fechas concretas (festivos, huecos ya reservados, etc.); no pueden elegirse ni como inicio ni como fin del rango
 * @property {number} [minNights] - Número mínimo de noches entre inicio y fin del rango
 * @property {number} [maxNights] - Número máximo de noches entre inicio y fin del rango
 * @property {DateIndicator[]} [indicators] - Indicadores de color mostrados en días concretos, con su leyenda
 * @property {boolean} [defaultOpen] - Estado inicial del panel al montar; solo pensado para demos/documentación
 */
export interface DateRangePickerProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value: DateRangeValue;
  onChange: (value: NormalizedDateRange) => void;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  error?: string;
  touched?: boolean;
  size?: DateRangePickerSize;
  className?: string;
  firstDayOfWeek?: 0 | 1;
  minDate?: DateInputValue;
  maxDate?: DateInputValue;
  disablePast?: boolean;
  disableFuture?: boolean;
  disableToday?: boolean;
  disabledDates?: (date: Date) => boolean;
  minNights?: number;
  maxNights?: number;
  indicators?: DateIndicator[];
  defaultOpen?: boolean;
}
