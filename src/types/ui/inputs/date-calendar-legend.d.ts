import type { DateIndicator } from "@/types/ui/inputs/date-picker";

/**
 * Props de {@link DateCalendarLegend}.
 * @interface DateCalendarLegendProps
 * @property {DateIndicator[]} [indicators] - Indicadores de color a documentar en la leyenda, además de los estados base (hoy, seleccionado, deshabilitado); por defecto `[]`
 * @property {boolean} [isRange] - Si es `true`, adapta los textos de la leyenda al modo rango (inicio/fin, dentro del rango) usado por DateRangePicker
 */
export interface DateCalendarLegendProps {
  indicators?: DateIndicator[];
  isRange?: boolean;
}
