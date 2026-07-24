"use client";

import "@/styles/04-components/ui/inputs/date-calendar.scss";
import "@/styles/04-components/ui/inputs/date-range-picker.scss";

import { useLocale, useTranslations } from "next-intl";
import {
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { DateRangePickerProps } from "@/types/ui/inputs/date-range-picker";
import {
  addMonths,
  dateKey,
  daysBetween,
  formatShortDate,
  getIndicatorColorsForDay,
  getNextFocusedDate,
  isBeforeDay,
  isDateDisabled,
  isNextMonthDisabled,
  isPrevMonthDisabled,
  isSameDay,
  isWithinRange,
  startOfDay,
  startOfMonth,
  toDateOrNull,
} from "@/utils/dateUtils";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react";

import DateCalendarLegend from "./DateCalendarLegend";
import DateCalendarMonth from "./DateCalendarMonth";

const OPEN_KEYS = ["ArrowDown", "ArrowUp", "Enter", " "];

/** Posición calculada del calendario respecto al viewport (portal a document.body). */
interface DropdownPosition {
  top: number;
  left: number;
  placement: "bottom" | "top";
}

function clampDayToMonth(day: number, monthDate: Date): Date {
  const lastDay = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  return new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    Math.min(day, lastDay),
  );
}

/**
 * Selector de rango de fechas (combobox + dos meses de calendario) con
 * selección de inicio/fin en dos clics, restricciones de noches mínimas/máximas
 * y navegación por teclado; el panel se renderiza en un portal.
 * @param {DateRangePickerProps} props - Propiedades del componente
 * @returns {JSX.Element} El campo de rango de fechas con su panel de calendario
 */
export default function DateRangePicker({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  required,
  disabled,
  clearable,
  error,
  touched,
  size = "md",
  className,
  firstDayOfWeek = 1,
  minDate,
  maxDate,
  disablePast,
  disableFuture,
  disableToday,
  disabledDates,
  minNights,
  maxNights,
  indicators,
  defaultOpen = false,
}: DateRangePickerProps) {
  const locale = useLocale();
  const t = useTranslations("Common.DatePicker");
  const tValidations = useTranslations("Validations");
  const resolvedPlaceholder = placeholder ?? t("selectDateRange");
  const reactId = useId();
  const inputId = id ?? reactId;
  const panelId = `${inputId}-panel`;
  const startGridLabelId = `${inputId}-start-grid-label`;
  const endGridLabelId = `${inputId}-end-grid-label`;
  const normalizedValue = {
    startDate: toDateOrNull(value.startDate),
    endDate: toDateOrNull(value.endDate),
  };

  const constraints = {
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    disableToday,
    disabledDates,
  };

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const [viewDate, setViewDate] = useState(() =>
    startOfMonth(normalizedValue.startDate ?? new Date()),
  );
  const [focusedDate, setFocusedDate] = useState<Date | null>(() =>
    startOfDay(normalizedValue.startDate ?? new Date()),
  );
  const [pendingStart, setPendingStart] = useState<Date | null>(
    normalizedValue.startDate,
  );
  const [pendingEnd, setPendingEnd] = useState<Date | null>(
    normalizedValue.endDate,
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const registerDayRef = (key: string, el: HTMLButtonElement | null) => {
    if (el) dayRefs.current.set(key, el);
    else dayRefs.current.delete(key);
  };

  const computePosition = () => {
    const trigger = triggerRef.current;
    /* v8 ignore next -- defensivo: computePosition solo se invoca desde manejadores (apertura, scroll/resize) que solo se disparan con el trigger ya montado */
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement: DropdownPosition["placement"] =
      spaceBelow < 380 && spaceAbove > spaceBelow ? "top" : "bottom";

    setPosition({
      top: placement === "bottom" ? rect.bottom + 4 : rect.top - 4,
      left: rect.left,
      placement,
    });
  };

  // Calcula la posición si el panel nace abierto (demos/documentación)
  useEffect(() => {
    if (defaultOpen) computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closePanel = (focusTrigger = true) => {
    setIsOpen(false);
    setHoverDate(null);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const openPanel = () => {
    /* v8 ignore next -- defensivo: openPanel solo se invoca desde el trigger (clic o teclado), y ambos ya impiden llegar aquí si está deshabilitado: un <button disabled> no dispara clic nativo, y handleTriggerKeyDown corta antes */
    if (disabled) return;
    computePosition();
    setPendingStart(normalizedValue.startDate);
    setPendingEnd(normalizedValue.endDate);
    const base = normalizedValue.startDate ?? new Date();
    setViewDate(startOfMonth(base));
    setFocusedDate(startOfDay(base));
    setIsOpen(true);
  };

  // El rango puede saltar por encima de días deshabilitados: la vista previa
  // no se recorta, simplemente esos días se ven marcados como no disponibles.
  const previewEnd =
    pendingEnd ??
    (hoverDate && pendingStart && !isBeforeDay(hoverDate, pendingStart)
      ? hoverDate
      : null);

  const isDayDisabled = (date: Date) => {
    if (isDateDisabled(date, constraints)) return true;
    if (pendingStart && !pendingEnd && !isBeforeDay(date, pendingStart)) {
      const nights = daysBetween(pendingStart, date);
      if (minNights && nights < minNights) return true;
      if (maxNights && nights > maxNights) return true;
    }
    return false;
  };

  const selectDate = (date: Date) => {
    /* v8 ignore next -- defensivo: selectDate solo se invoca desde DateCalendarMonth, que ya deshabilita nativamente (`disabled`) los días no seleccionables tanto para clic como para teclado (un botón disabled no puede recibir foco ni clic) */
    if (isDayDisabled(date)) return;

    if (!pendingStart || (pendingStart && pendingEnd)) {
      setPendingStart(date);
      setPendingEnd(null);
      return;
    }

    if (isBeforeDay(date, pendingStart)) {
      setPendingStart(date);
      setPendingEnd(null);
      return;
    }

    setPendingEnd(date);
    onChange({ startDate: pendingStart, endDate: date });
    closePanel();
  };

  const clearRange = () => {
    setPendingStart(null);
    setPendingEnd(null);
    onChange({ startDate: null, endDate: null });
  };

  const goToMonth = (offset: number) => {
    setViewDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      setFocusedDate((prevFocused) => {
        /* v8 ignore next -- defensivo: `focusedDate` nunca es `null` tras el montaje inicial (siempre se inicializa y se actualiza con una `Date` real); el tipo `Date | null` solo refleja el estado inicial teórico */
        const day = prevFocused?.getDate() ?? 1;
        return clampDayToMonth(day, next);
      });
      return next;
    });
  };

  // Reposiciona en scroll/resize y cierra al hacer click fuera del trigger o del panel
  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => computePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      closePanel(false);
    };

    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  // Evita que el panel (más ancho que el trigger) se salga del viewport por la derecha
  useEffect(() => {
    if (!isOpen || !panelRef.current || !position) return;
    const panelRect = panelRef.current.getBoundingClientRect();
    const overflowRight = panelRect.right - (window.innerWidth - 8);
    if (overflowRight > 0) {
      setPosition((prev) => {
        /* v8 ignore next -- defensivo: en este punto `position` ya es no nulo (el efecto corta antes si no lo es), así que `prev` recibido aquí también lo es; la alternativa solo protege el tipo `DropdownPosition | null` */
        if (!prev) return prev;
        return { ...prev, left: Math.max(8, prev.left - overflowRight) };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, position?.top]);

  // Mueve el foco de teclado al día activo tras navegar
  useEffect(() => {
    if (!isOpen || !focusedDate) return;
    dayRefs.current.get(dateKey(focusedDate))?.focus();
  }, [isOpen, focusedDate, viewDate]);

  const handleTriggerKeyDown = (event: ReactKeyboardEvent) => {
    if (disabled || isOpen) return;
    if (OPEN_KEYS.includes(event.key)) {
      event.preventDefault();
      openPanel();
    }
  };

  const handleDayKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    date: Date,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDate(date);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key === "Tab") {
      closePanel(false);
      return;
    }

    const next = getNextFocusedDate(
      date,
      event.key,
      firstDayOfWeek,
      event.shiftKey,
    );
    if (!next) return;

    event.preventDefault();
    setFocusedDate(next);
    const rightMonth = addMonths(viewDate, 1);
    const isVisible =
      (next.getFullYear() === viewDate.getFullYear() &&
        next.getMonth() === viewDate.getMonth()) ||
      (next.getFullYear() === rightMonth.getFullYear() &&
        next.getMonth() === rightMonth.getMonth());
    if (!isVisible) {
      setViewDate(startOfMonth(next));
    }
  };

  const isRangeStart = (date: Date) =>
    pendingStart ? isSameDay(date, pendingStart) : false;
  const isRangeEnd = (date: Date) =>
    previewEnd ? isSameDay(date, previewEnd) : false;
  const isInRange = (date: Date) => {
    if (!pendingStart || !previewEnd) return false;
    return isWithinRange(date, pendingStart, previewEnd);
  };

  const prevDisabled = isPrevMonthDisabled(viewDate, constraints);
  const rightMonth = addMonths(viewDate, 1);
  const nextDisabled = isNextMonthDisabled(rightMonth, constraints);

  const displayValue = normalizedValue.startDate
    ? normalizedValue.endDate
      ? `${formatShortDate(normalizedValue.startDate, locale)} - ${formatShortDate(normalizedValue.endDate, locale)}`
      : `${formatShortDate(normalizedValue.startDate, locale)} - …`
    : "";

  const panel = isOpen && position && (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="false"
      // v8 ignore next -- defensivo: la rama `resolvedPlaceholder` solo se alcanza sin `label` (no existe `ariaLabel` de respaldo en este componente), lo que dejaría el trigger (role="combobox", sin nombre por contenido) sin nombre accesible; una historia así violaría a11y a propósito, así que es inalcanzable en una historia válida
      aria-label={label || resolvedPlaceholder}
      className="date-range-picker__panel"
      data-outside-click-ignore=""
      style={{
        position: "fixed",
        left: position.left,
        ...(position.placement === "bottom"
          ? { top: position.top }
          : { bottom: window.innerHeight - position.top }),
      }}
      onKeyDown={(event) => {
        // Red de seguridad: Escape cierra el panel desde cualquier elemento
        // enfocado dentro de él (no solo desde una celda de día, que ya lo
        // gestiona handleDayKeyDown), p. ej. con el foco en los botones de
        // navegación de mes.
        if (event.key === "Escape") {
          event.preventDefault();
          closePanel();
        }
      }}
    >
      <div className="date-calendar-panel date-calendar-panel--range">
        <div className="date-calendar-panel__nav">
          <button
            type="button"
            className="date-calendar-panel__nav-btn"
            aria-label={t("previousMonth")}
            disabled={prevDisabled}
            onClick={() => goToMonth(-1)}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className="date-calendar-panel__nav-btn"
            aria-label={t("nextMonth")}
            disabled={nextDisabled}
            onClick={() => goToMonth(1)}
          >
            <ChevronRightIcon />
          </button>
        </div>

        <div className="date-calendar-panel__months">
          <DateCalendarMonth
            year={viewDate.getFullYear()}
            month={viewDate.getMonth()}
            locale={locale}
            firstDayOfWeek={firstDayOfWeek}
            focusedDate={focusedDate}
            gridLabelId={startGridLabelId}
            isDisabled={isDayDisabled}
            isSelected={() => false}
            isRangeStart={isRangeStart}
            isRangeEnd={isRangeEnd}
            isInRange={isInRange}
            getDayIndicatorColors={(date) =>
              getIndicatorColorsForDay(date, indicators)
            }
            onSelectDay={selectDate}
            onHoverDay={setHoverDate}
            onFocusDay={setFocusedDate}
            onKeyDownDay={handleDayKeyDown}
            registerDayRef={registerDayRef}
          />
          <DateCalendarMonth
            year={rightMonth.getFullYear()}
            month={rightMonth.getMonth()}
            locale={locale}
            firstDayOfWeek={firstDayOfWeek}
            focusedDate={focusedDate}
            gridLabelId={endGridLabelId}
            isDisabled={isDayDisabled}
            isSelected={() => false}
            isRangeStart={isRangeStart}
            isRangeEnd={isRangeEnd}
            isInRange={isInRange}
            getDayIndicatorColors={(date) =>
              getIndicatorColorsForDay(date, indicators)
            }
            onSelectDay={selectDate}
            onHoverDay={setHoverDate}
            onFocusDay={setFocusedDate}
            onKeyDownDay={handleDayKeyDown}
            registerDayRef={registerDayRef}
          />
        </div>

        <DateCalendarLegend indicators={indicators} isRange />
      </div>
    </div>
  );

  return (
    <div
      className={`date-range-picker__group${className ? ` ${className}` : ""}`}
    >
      {label && (
        <label
          id={`${inputId}-label`}
          className={`date-picker__label${error && touched ? " label__error" : ""}`}
        >
          {label}
          {required && <span className="date-picker__required">*</span>}
        </label>
      )}

      {name && (
        <>
          <input
            type="hidden"
            name={`${name}Start`}
            value={
              normalizedValue.startDate
                ? normalizedValue.startDate.toISOString()
                : ""
            }
          />
          <input
            type="hidden"
            name={`${name}End`}
            value={
              normalizedValue.endDate
                ? normalizedValue.endDate.toISOString()
                : ""
            }
          />
        </>
      )}

      <div
        className={`date-range-picker__wrapper${size === "sm" ? " date-range-picker__wrapper--sm" : ""}`}
      >
        <button
          ref={triggerRef}
          id={inputId}
          type="button"
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={panelId}
          // v8 ignore next -- defensivo: mismo motivo que el aria-label del panel; sin `label` el trigger se queda sin nombre accesible, así que esta rama es inalcanzable en una historia válida
          aria-labelledby={label ? `${inputId}-label` : undefined}
          aria-required={required}
          aria-invalid={Boolean(error && touched)}
          disabled={disabled}
          className={`date-range-picker${error && touched ? " date-range-picker__error" : ""}`}
          onClick={() => (isOpen ? closePanel() : openPanel())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            className={`date-range-picker__value${!displayValue ? " date-range-picker__value--placeholder" : ""}`}
          >
            {displayValue || resolvedPlaceholder}
          </span>
        </button>

        {clearable &&
          (normalizedValue.startDate || normalizedValue.endDate) &&
          !disabled && (
            <button
              type="button"
              className="date-range-picker__clear"
              aria-label={t("clearDates")}
              onClick={(event) => {
                event.stopPropagation();
                clearRange();
              }}
            >
              <XIcon />
            </button>
          )}

        <CalendarIcon className="date-range-picker__icon" />
      </div>

      {typeof document !== "undefined" &&
        panel &&
        createPortal(panel, document.body)}

      {error && touched && (
        <p className="label__error">* {tValidations(error)}</p>
      )}
    </div>
  );
}
