"use client";

import { useTranslations } from "next-intl";

import { DateCalendarLegendProps } from "@/types/ui/inputs/date-calendar-legend";
import { resolveIndicatorColor } from "@/utils/dateUtils";

/** Leyenda con el significado de cada color del calendario, más los indicadores personalizados. */
export default function DateCalendarLegend({
  indicators = [],
  isRange,
}: DateCalendarLegendProps) {
  const t = useTranslations("Common.DatePicker");

  return (
    <ul className="date-calendar-legend">
      <li className="date-calendar-legend__item">
        <span className="date-calendar-legend__swatch date-calendar-legend__swatch--today" />
        {t("today")}
      </li>
      <li className="date-calendar-legend__item">
        <span className="date-calendar-legend__swatch date-calendar-legend__swatch--selected" />
        {isRange ? t("rangeStartEnd") : t("selected")}
      </li>
      {isRange && (
        <li className="date-calendar-legend__item">
          <span className="date-calendar-legend__swatch date-calendar-legend__swatch--in-range" />
          {t("inRange")}
        </li>
      )}
      <li className="date-calendar-legend__item">
        <span className="date-calendar-legend__swatch date-calendar-legend__swatch--disabled" />
        {t("unavailable")}
      </li>

      {indicators.map((indicator, index) => (
        <li key={indicator.label} className="date-calendar-legend__item">
          <span
            className="date-calendar-legend__dot"
            style={{
              backgroundColor: resolveIndicatorColor(index, indicator.color),
            }}
          />
          {indicator.label}
        </li>
      ))}
    </ul>
  );
}
