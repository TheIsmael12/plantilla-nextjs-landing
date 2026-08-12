"use client";

import "@/styles/04-components/ui/inputs/date-calendar.scss";
import "@/styles/04-components/ui/inputs/date-picker.scss";

import { useLocale, useTranslations } from "next-intl";
import {
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { DatePickerProps } from "@/types/ui/inputs/date-picker";
import {
  dateKey,
  formatShortDate,
  getDecadeStart,
  getIndicatorColorsForDay,
  getMonthLabel,
  getNextFocusedDate,
  isDateDisabled,
  isMonthOutOfRange,
  isNextMonthDisabled,
  isPrevMonthDisabled,
  isSameDay,
  isYearOutOfRange,
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
import DateMonthYearGrid from "./DateMonthYearGrid";

/** Qué rejilla muestra el panel: los días del mes, o el salto rápido de mes/año. */
type DatePickerViewMode = "days" | "months" | "years";

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
 * Selector de fecha accesible (combobox + calendario) con navegación por
 * teclado, restricciones configurables (mínimo/máximo, fechas deshabilitadas,
 * pasado/futuro/hoy) e indicadores por día; el panel se renderiza en un portal.
 * @param {DatePickerProps} props - Propiedades del componente
 * @returns {JSX.Element} El campo de fecha con su panel de calendario
 */
export default function DatePicker({
  id,
  name,
  label,
  placeholder,
  ariaLabel,
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
  indicators,
  defaultOpen = false,
}: DatePickerProps) {
  const locale = useLocale();
  const t = useTranslations("Common.DatePicker");
  const tValidations = useTranslations("Validations");
  const resolvedPlaceholder = placeholder ?? t("selectDate");
  const reactId = useId();
  const inputId = id ?? reactId;
  const panelId = `${inputId}-panel`;
  const gridLabelId = `${inputId}-grid-label`;
  const normalizedValue = toDateOrNull(value);

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
    startOfMonth(normalizedValue ?? new Date()),
  );
  const [focusedDate, setFocusedDate] = useState<Date | null>(() =>
    startOfDay(normalizedValue ?? new Date()),
  );
  const [viewMode, setViewMode] = useState<DatePickerViewMode>("days");

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
      spaceBelow < 340 && spaceAbove > spaceBelow ? "top" : "bottom";

    setPosition({
      top: placement === "bottom" ? rect.bottom + 4 : rect.top - 4,
      left: rect.left,
      placement,
    });
  };

  // Calcula la posición si el calendario nace abierto (demos/documentación)
  useEffect(() => {
    if (defaultOpen) computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeCalendar = (focusTrigger = true) => {
    setIsOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const openCalendar = () => {
    /* v8 ignore next -- defensivo: openCalendar solo se invoca desde el trigger (clic o teclado), y ambos ya impiden llegar aquí si está deshabilitado: un <button disabled> no dispara clic nativo, y handleTriggerKeyDown corta antes */
    if (disabled) return;
    computePosition();
    const base = normalizedValue ?? new Date();
    setViewDate(startOfMonth(base));
    setFocusedDate(startOfDay(base));
    setViewMode("days");
    setIsOpen(true);
  };

  const selectDate = (date: Date) => {
    /* v8 ignore next -- defensivo: selectDate solo se invoca desde DateCalendarMonth, que ya deshabilita nativamente (`disabled`) los días no seleccionables tanto para clic como para teclado (un botón disabled no puede recibir foco ni clic) */
    if (isDateDisabled(date, constraints)) return;
    onChange(startOfDay(date));
    closeCalendar();
  };

  const clearDate = () => {
    onChange(null);
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

  /*
   * Un año o un tramo de doce, según el modo activo — es lo que mueven las mismas dos flechas del
   * `nav` mientras el panel está en "months"/"years", en vez de mes a mes. Solo cambia el año de
   * `viewDate`: el día se conserva igual que en `goToMonth`, para que volver a "days" no pierda por
   * dónde se iba.
   */
  const goToYearStep = (offset: number) => {
    const years = viewMode === "years" ? offset * 12 : offset;
    setViewDate((prev) => {
      const next = new Date(prev.getFullYear() + years, prev.getMonth(), 1);
      setFocusedDate((prevFocused) => {
        /* v8 ignore next -- defensivo: ver goToMonth */
        const day = prevFocused?.getDate() ?? 1;
        return clampDayToMonth(day, next);
      });
      return next;
    });
  };

  /** Elige un mes en la vista de salto rápido y vuelve directamente a la rejilla de días. */
  const selectMonth = (month: number) => {
    setViewDate((prev) => {
      const next = new Date(prev.getFullYear(), month, 1);
      setFocusedDate((prevFocused) => {
        /* v8 ignore next -- defensivo: ver goToMonth */
        const day = prevFocused?.getDate() ?? 1;
        return clampDayToMonth(day, next);
      });
      return next;
    });
    setViewMode("days");
  };

  /*
   * Elegir un año no vuelve a "days": entre las dos preguntas («¿qué año?» y «¿qué mes?») lo natural
   * es encadenarlas, igual que hace un desplegable año→mes→día. Si el mes ya elegido no cabe en el
   * año nuevo por las restricciones activas, se pasa a "days" directamente — no tiene sentido
   * ofrecer una vista de meses donde ya se sabe cuál tocaría.
   */
  const selectYear = (year: number) => {
    setViewDate((prev) => new Date(year, prev.getMonth(), 1));
    setViewMode(isMonthOutOfRange(year, viewDate.getMonth(), constraints) ? "days" : "months");
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
      closeCalendar(false);
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
      openCalendar();
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
      closeCalendar();
      return;
    }
    /*
     * Tab cierra el calendario y **devuelve el foco al campo**, en vez de dejarlo en el aire.
     *
     * Antes se cerraba sin recolocarlo (`closeCalendar(false)`), con la idea de que el tabulador siguiera su
     * camino solo. No lo seguía: el día que tenía el foco desaparecía del documento al cerrarse el panel, así
     * que el navegador se quedaba sin punto de partida y el foco saltaba al principio de la página — desde un
     * modal, eso es salirse del modal. Devolviéndolo al campo, el Tab que se acaba de pulsar continúa desde
     * él y va al control siguiente, que es lo que uno espera.
     */
    if (event.key === "Tab") {
      closeCalendar();
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
    if (
      next.getMonth() !== viewDate.getMonth() ||
      next.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(startOfMonth(next));
    }
  };

  /*
   * Qué deshabilita cada flecha del `nav` depende del modo activo: un mes en "days", un año en
   * "months" (no tiene sentido ofrecer 2027 si nada de 2027 es seleccionable) y un tramo de doce en
   * "years". Todas comparten el mismo criterio de `DateConstraints` que ya usa la rejilla de días.
   */
  const prevDisabled =
    viewMode === "days"
      ? isPrevMonthDisabled(viewDate, constraints)
      : viewMode === "months"
        ? isYearOutOfRange(viewDate.getFullYear() - 1, constraints)
        : isYearOutOfRange(getDecadeStart(viewDate.getFullYear()) - 1, constraints);
  const nextDisabled =
    viewMode === "days"
      ? isNextMonthDisabled(viewDate, constraints)
      : viewMode === "months"
        ? isYearOutOfRange(viewDate.getFullYear() + 1, constraints)
        : isYearOutOfRange(getDecadeStart(viewDate.getFullYear()) + 12, constraints);
  const navLabel =
    viewMode === "days"
      ? { prev: t("previousMonth"), next: t("nextMonth") }
      : viewMode === "months"
        ? { prev: t("previousYear"), next: t("nextYear") }
        : { prev: t("previousYears"), next: t("nextYears") };
  const displayValue = normalizedValue
    ? formatShortDate(normalizedValue, locale)
    : "";

  const panel = isOpen && position && (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="false"
      // v8 ignore next -- defensivo: el último eslabón (usar `resolvedPlaceholder`) solo se alcanza si no se pasa ni `label` ni `ariaLabel`, lo que dejaría el trigger (role="combobox", sin nombre por contenido) sin nombre accesible; una historia así violaría a11y a propósito, así que es inalcanzable en una historia válida
      aria-label={label || ariaLabel || resolvedPlaceholder}
      className="date-picker__panel"
      data-outside-click-ignore=""
      style={{
        position: "fixed",
        left: position.left,
        ...(position.placement === "bottom"
          ? { top: position.top }
          : { bottom: window.innerHeight - position.top }),
      }}
      onKeyDown={(event) => {
        // Escape debe cerrar el calendario sin importar qué control interno
        // tenga el foco (botones de mes anterior/siguiente incluidos), no
        // solo las celdas del grid (ver handleDayKeyDown).
        if (event.key === "Escape") {
          event.preventDefault();
          closeCalendar();
        }
      }}
    >
      <div className="date-calendar-panel">
        <div className="date-calendar-panel__nav">
          <button
            type="button"
            className="date-calendar-panel__nav-btn"
            aria-label={navLabel.prev}
            disabled={prevDisabled}
            onClick={() => (viewMode === "days" ? goToMonth(-1) : goToYearStep(-1))}
          >
            <ChevronLeftIcon />
          </button>

          {viewMode === "days" && (
            <button
              type="button"
              className="date-calendar-panel__nav-label"
              aria-label={t("selectMonth")}
              onClick={() => setViewMode("months")}
            >
              {getMonthLabel(viewDate, locale)}
            </button>
          )}
          {viewMode === "months" && (
            <button
              type="button"
              className="date-calendar-panel__nav-label"
              aria-label={t("selectYear")}
              onClick={() => setViewMode("years")}
            >
              {viewDate.getFullYear()}
            </button>
          )}
          {viewMode === "years" && (
            <span className="date-calendar-panel__nav-label date-calendar-panel__nav-label--static">
              {getDecadeStart(viewDate.getFullYear())} –{" "}
              {getDecadeStart(viewDate.getFullYear()) + 11}
            </span>
          )}

          <button
            type="button"
            className="date-calendar-panel__nav-btn"
            aria-label={navLabel.next}
            disabled={nextDisabled}
            onClick={() => (viewMode === "days" ? goToMonth(1) : goToYearStep(1))}
          >
            <ChevronRightIcon />
          </button>
        </div>

        {viewMode === "days" && (
          <DateCalendarMonth
            year={viewDate.getFullYear()}
            month={viewDate.getMonth()}
            locale={locale}
            firstDayOfWeek={firstDayOfWeek}
            focusedDate={focusedDate}
            gridLabelId={gridLabelId}
            showMonthLabel={false}
            isDisabled={(date) => isDateDisabled(date, constraints)}
            isSelected={(date) =>
              normalizedValue ? isSameDay(date, normalizedValue) : false
            }
            getDayIndicatorColors={(date) =>
              getIndicatorColorsForDay(date, indicators)
            }
            onSelectDay={selectDate}
            onFocusDay={setFocusedDate}
            onKeyDownDay={handleDayKeyDown}
            registerDayRef={registerDayRef}
          />
        )}

        {viewMode !== "days" && (
          <DateMonthYearGrid
            mode={viewMode}
            year={viewDate.getFullYear()}
            month={viewMode === "months" ? viewDate.getMonth() : undefined}
            locale={locale}
            ariaLabel={viewMode === "months" ? t("selectMonth") : t("selectYear")}
            isMonthDisabled={(month) =>
              isMonthOutOfRange(viewDate.getFullYear(), month, constraints)
            }
            isYearDisabled={(year) => isYearOutOfRange(year, constraints)}
            onSelectMonth={selectMonth}
            onSelectYear={selectYear}
          />
        )}

        {viewMode === "days" && <DateCalendarLegend indicators={indicators} />}
      </div>
    </div>
  );

  return (
    <div className={`date-picker__group${className ? ` ${className}` : ""}`}>
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
        <input
          type="hidden"
          name={name}
          value={normalizedValue ? normalizedValue.toISOString() : ""}
        />
      )}

      <div
        className={`date-picker__wrapper${size === "sm" ? " date-picker__wrapper--sm" : ""}`}
      >
        <button
          ref={triggerRef}
          id={inputId}
          type="button"
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          aria-label={!label ? ariaLabel : undefined}
          aria-required={required}
          aria-invalid={Boolean(error && touched)}
          disabled={disabled}
          className={`date-picker${error && touched ? " date-picker__error" : ""}`}
          onClick={() => (isOpen ? closeCalendar() : openCalendar())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            className={`date-picker__value${!normalizedValue ? " date-picker__value--placeholder" : ""}`}
          >
            {displayValue || resolvedPlaceholder}
          </span>
        </button>

        {clearable && normalizedValue && !disabled && (
          <button
            type="button"
            className="date-picker__clear"
            aria-label={t("clearDate")}
            onClick={(event) => {
              event.stopPropagation();
              clearDate();
            }}
          >
            <XIcon />
          </button>
        )}

        <CalendarIcon className="date-picker__icon" />
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
