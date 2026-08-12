"use client";

import "@/styles/04-components/ui/tables/table.scss";

import { useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useOutsideClick } from "@/hooks/useOutsideClick";

import CheckboxGroup from "@/components/ui/inputs/CheckboxGroup";
import DatePicker from "@/components/ui/inputs/DatePicker";
import DateRangePicker from "@/components/ui/inputs/DateRangePicker";
import Select from "@/components/ui/inputs/Select";

import type { Filter, FilterValue, FiltersProps } from "@/types/ui/tables/table";

import { FilterIcon, XIcon } from "lucide-react";

/**
 * Indica si el valor actual de un filtro cuenta como "activo" (distinto de
 * su estado vacío por defecto), para el contador del botón "Filtros" y el
 * botón de limpiar todo.
 * @param {Filter} filter - Definición del filtro
 * @param {FilterValue} [value] - Valor actual del filtro
 * @returns {boolean} `true` si el filtro tiene una selección/fecha activa
 */
function isFilterActive(filter: Filter, value?: FilterValue): boolean {
  switch (filter.type) {
    case "select":
      return typeof value === "string" && value !== "";
    case "multi-select":
      return Array.isArray(value) && value.length > 0;
    case "date":
      return value instanceof Date || (typeof value === "string" && value !== "");
    case "date-range":
      return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        (Boolean(value.startDate) || Boolean(value.endDate))
      );
  }
}

/**
 * Botón "Filtros" de la barra de herramientas de {@link Table} (a la
 * izquierda del buscador): despliega un panel con un control por cada
 * filtro de `filters` (`Select` simple o múltiple, `DatePicker` o
 * `DateRangePicker` según su `type`). Siempre controlado por el llamador —
 * a diferencia de paginación/orden/búsqueda, un filtro de negocio (estado,
 * rol, rango de fechas...) no tiene un modo "en memoria" razonable, así que
 * no gestiona su propio estado interno. El botón "Limpiar filtros" delega
 * en `onClearAll` (una única notificación al llamador) en vez de llamar a
 * `onChange` una vez por filtro: el llamador construye su propia
 * actualización (p. ej. de la URL) en un solo paso — llamar a `onChange`
 * en bucle sobre un `onChange` que a su vez actualiza la URL de forma
 * asíncrona hacía que solo el último filtro del bucle se limpiara de
 * verdad, porque cada llamada partía de la misma URL sin ver el resultado
 * de las anteriores. El panel usa {@link useFocusTrap} (igual que
 * `ModalComponent`): `Tab`/`Shift+Tab` no se escapan del desplegable y
 * `Escape` lo cierra, además del botón de cierre explícito.
 * @param {FiltersProps} props - Propiedades del componente
 * @returns {JSX.Element} El botón de filtros y su panel desplegable
 */
export default function Filters({
  filters,
  values,
  onChange,
  onClearAll,
}: FiltersProps) {
  const t = useTranslations("Table");

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useOutsideClick(ref, {
    onOutsideClick: close,
    isActive: isOpen,
  });

  useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    onEscape: close,
    ref,
  });

  const activeFilters = filters.filter((filter) => isFilterActive(filter, values[filter.key]));

  return (
    <div className="table__filters" ref={ref}>
      <button
        type="button"
        className="table__filters__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <FilterIcon />
        {t("filters")}
        {activeFilters.length > 0 && (
          <span className="table__filters__count">{activeFilters.length}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="table__filters__panel"
          role="dialog"
          aria-modal="true"
          aria-label={t("filters")}
        >
          <div className="table__filters__panel__header">
            <span className="table__filters__panel__title">{t("filters")}</span>
            <button
              type="button"
              className="table__filters__panel__close"
              aria-label={t("closeFilters")}
              onClick={close}
            >
              <XIcon />
            </button>
          </div>

          {onClearAll && activeFilters.length > 0 && (
            <button
              type="button"
              className="table__filters__clear"
              onClick={onClearAll}
            >
              <XIcon />
              {t("clearFilters")}
            </button>
          )}

          {filters.map((filter) => {
            const value = values[filter.key];

            if (filter.type === "select") {
              return (
                <Select
                  key={filter.key}
                  label={filter.label}
                  placeholder={filter.placeholder}
                  noTranslate
                  value={typeof value === "string" ? value : ""}
                  onChange={(next) => onChange(filter.key, next)}
                  options={filter.options}
                  className="table__filters__field select__full"
                />
              );
            }

            if (filter.type === "multi-select") {
              return (
                <CheckboxGroup
                  key={filter.key}
                  label={filter.label}
                  value={Array.isArray(value) ? value : []}
                  onChange={(next) => onChange(filter.key, next)}
                  options={filter.options}
                  className="table__filters__field checkbox-group__full"
                />
              );
            }

            if (filter.type === "date") {
              return (
                <DatePicker
                  key={filter.key}
                  size="sm"
                  label={filter.label}
                  clearable
                  minDate={filter.minDate}
                  maxDate={filter.maxDate}
                  disableFuture={filter.disableFuture}
                  disablePast={filter.disablePast}
                  value={value instanceof Date || typeof value === "string" ? value : null}
                  onChange={(date) => onChange(filter.key, date)}
                  className="table__filters__field date-picker__full"
                />
              );
            }

            const rangeValue =
              typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)
                ? value
                : { startDate: null, endDate: null };

            return (
              <DateRangePicker
                key={filter.key}
                size="sm"
                label={filter.label}
                clearable
                minDate={filter.minDate}
                maxDate={filter.maxDate}
                value={rangeValue}
                onChange={(range) => onChange(filter.key, range)}
                className="table__filters__field date-range-picker__full"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
