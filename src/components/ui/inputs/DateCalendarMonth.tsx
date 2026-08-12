"use client";

import { DateCalendarMonthProps } from "@/types/ui/inputs/date-calendar-month";
import type { CalendarDay } from "@/types/ui/inputs/date-picker";
import {
  dateKey,
  getCalendarMatrix,
  getMonthLabel,
  getWeekdayLabels,
  isSameDay,
} from "@/utils/dateUtils";

/** Rejilla de un único mes reutilizada por DatePicker y DateRangePicker. */
export default function DateCalendarMonth({
  year,
  month,
  locale,
  firstDayOfWeek,
  focusedDate,
  gridLabelId,
  showMonthLabel = true,
  isDisabled,
  isSelected,
  isRangeStart,
  isRangeEnd,
  isInRange,
  getDayIndicatorColors,
  onSelectDay,
  onHoverDay,
  onFocusDay,
  onKeyDownDay,
  registerDayRef,
}: DateCalendarMonthProps) {
  const days = getCalendarMatrix(year, month, firstDayOfWeek);
  const weeks = chunkIntoWeeks(days);
  const weekdayLabels = getWeekdayLabels(locale, firstDayOfWeek);
  const today = new Date();

  return (
    <div className="date-calendar">
      <p
        id={gridLabelId}
        className={`date-calendar__month-label${showMonthLabel ? "" : " sr-only"}`}
      >
        {getMonthLabel(new Date(year, month, 1), locale)}
      </p>

      <div className="date-calendar__weekdays">
        {weekdayLabels.map((label, index) => (
          <span key={index} className="date-calendar__weekday">
            {label}
          </span>
        ))}
      </div>

      <div
        role="grid"
        aria-labelledby={gridLabelId}
        className="date-calendar__grid"
      >
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className="date-calendar__week">
            {week.map(({ date, isCurrentMonth }) => {
              const disabled = isDisabled(date);
              const selected = isSelected(date);
              const rangeStart = isRangeStart?.(date) ?? false;
              const rangeEnd = isRangeEnd?.(date) ?? false;
              const inRange = isInRange?.(date) ?? false;
              const isTodayDate = isSameDay(date, today);
              const isFocused = focusedDate
                ? isSameDay(date, focusedDate)
                : false;
              const key = dateKey(date);
              const indicatorColors = getDayIndicatorColors?.(date) ?? [];

              return (
                <button
                  key={key}
                  ref={(el) => registerDayRef(key, el)}
                  type="button"
                  role="gridcell"
                  data-date={key}
                  tabIndex={isFocused ? 0 : -1}
                  disabled={disabled}
                  aria-selected={selected || rangeStart || rangeEnd}
                  aria-current={isTodayDate ? "date" : undefined}
                  aria-label={date.toLocaleDateString(locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  className={[
                    "date-calendar__day",
                    !isCurrentMonth && "date-calendar__day--outside",
                    isTodayDate && "date-calendar__day--today",
                    (selected || rangeStart || rangeEnd) &&
                      "date-calendar__day--selected",
                    rangeStart && "date-calendar__day--range-start",
                    rangeEnd && "date-calendar__day--range-end",
                    inRange &&
                      !rangeStart &&
                      !rangeEnd &&
                      "date-calendar__day--in-range",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => !disabled && onSelectDay(date)}
                  onMouseEnter={() => onHoverDay?.(date)}
                  onFocus={() => onFocusDay(date)}
                  onKeyDown={(event) => onKeyDownDay(event, date)}
                >
                  <span className="date-calendar__day-number">
                    {date.getDate()}
                  </span>
                  {indicatorColors.length > 0 && (
                    <span className="date-calendar__day-dots">
                      {indicatorColors.slice(0, 3).map((color, dotIndex) => (
                        <span
                          key={dotIndex}
                          className="date-calendar__day-dot"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function chunkIntoWeeks(days: CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}
