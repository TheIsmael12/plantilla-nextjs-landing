/**
 * Valor de fecha aceptado por los inputs de fecha del sistema de diseño: un
 * `Date` nativo o una cadena "YYYY-MM-DD", para poder pasar fechas ya
 * serializadas (API, formularios) sin construir un `new Date(...)` manualmente.
 * @typedef {(Date|string)} DateInputValue
 */
export type DateInputValue = Date | string;

/**
 * Tamaños soportados por {@link DatePicker}.
 * @typedef {("sm"|"md")} DatePickerSize
 */
export type DatePickerSize = "sm" | "md";

/**
 * Indicador visual (punto de color) mostrado en días concretos del calendario,
 * cuyo significado se añade automáticamente a la leyenda (`DateCalendarLegend`).
 * @interface DateIndicator
 * @property {string} label - Texto de la leyenda que describe el indicador
 * @property {DateInputValue[]} dates - Fechas marcadas con este indicador
 * @property {string} [color] - Color CSS del punto; sin valor se asigna un color por defecto según su posición en la lista
 */
export interface DateIndicator {
  label: string;
  dates: DateInputValue[];
  color?: string;
}

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
 * Día de la rejilla mensual generada por `getCalendarMatrix`, indicando si
 * pertenece al mes visible o es relleno de la semana previa/siguiente.
 * @interface CalendarDay
 * @property {Date} date - Fecha representada por la celda
 * @property {boolean} isCurrentMonth - `true` si `date` pertenece al mes solicitado
 */
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

/**
 * Props de {@link DatePicker}.
 * @interface DatePickerProps
 * @property {string} [id] - Id del trigger, usado para asociar el `label` y el panel del calendario
 * @property {string} [name] - Nombre del campo, usado por el input oculto para Formik
 * @property {string} [label] - Etiqueta visible encima del campo
 * @property {string} [placeholder] - Texto mostrado cuando no hay fecha seleccionada; por defecto la clave `Common.DatePicker.selectDate`
 * @property {string} [ariaLabel] - `aria-label` del trigger cuando no hay `label` visible
 * @property {(DateInputValue|null)} value - Fecha seleccionada actualmente (prop controlada)
 * @property {(date: Date | null) => void} onChange - Handler invocado con la fecha elegida, o `null` al limpiar
 * @property {boolean} [required] - Marca el campo como obligatorio y pinta un asterisco junto al label
 * @property {boolean} [disabled] - Deshabilita el campo e impide abrir el calendario
 * @property {boolean} [clearable] - Muestra un botón para limpiar la fecha seleccionada
 * @property {string} [error] - Clave de traducción (namespace `Validations`) del error de Yup/servidor; solo se pinta si `touched` es `true`
 * @property {boolean} [touched] - Si el campo ha sido interactuado; controla cuándo se muestra `error`
 * @property {DatePickerSize} [size] - Tamaño visual del campo; por defecto "md"
 * @property {string} [className] - Clases CSS adicionales del contenedor
 * @property {(0|1)} [firstDayOfWeek] - Primer día de la semana del calendario (0 = domingo, 1 = lunes); por defecto 1
 * @property {DateInputValue} [minDate] - Fecha mínima seleccionable
 * @property {DateInputValue} [maxDate] - Fecha máxima seleccionable
 * @property {boolean} [disablePast] - Deshabilita fechas anteriores a hoy
 * @property {boolean} [disableFuture] - Deshabilita fechas posteriores a hoy
 * @property {boolean} [disableToday] - Deshabilita también hoy (combinado con `disablePast` exige fecha estrictamente posterior)
 * @property {(date: Date) => boolean} [disabledDates] - Predicado para deshabilitar fechas concretas (festivos, huecos ya reservados, etc.)
 * @property {DateIndicator[]} [indicators] - Indicadores de color mostrados en días concretos, con su leyenda
 * @property {boolean} [defaultOpen] - Estado inicial del calendario al montar; solo pensado para demos/documentación
 */
export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  ariaLabel?: string;
  value: DateInputValue | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  error?: string;
  touched?: boolean;
  size?: DatePickerSize;
  className?: string;
  firstDayOfWeek?: 0 | 1;
  minDate?: DateInputValue;
  maxDate?: DateInputValue;
  disablePast?: boolean;
  disableFuture?: boolean;
  disableToday?: boolean;
  disabledDates?: (date: Date) => boolean;
  indicators?: DateIndicator[];
  defaultOpen?: boolean;
}
