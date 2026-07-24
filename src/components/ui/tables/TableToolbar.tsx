"use client";

import { useTranslations } from "next-intl";

import Input from "@/components/ui/inputs/Input";
import Filters from "@/components/ui/tables/Filters";
import TableBulkActions from "@/components/ui/tables/TableBulkActions";

import type { TableToolbarProps } from "@/types/ui/tables/table";

import { SearchIcon } from "lucide-react";

/**
 * Barra de herramientas de {@link Table}: búsqueda global y filtros
 * (`Filters`) a la izquierda, acciones masivas (`TableBulkActions`) a
 * la derecha. No se renderiza nada si ninguna de las tres partes aplica (ni
 * `searchable`, ni `filters`, ni `actions`).
 * @template TData - Tipo de fila de la tabla
 * @param {TableToolbarProps<TData>} props - Propiedades del componente
 * @returns {JSX.Element | null} La barra de herramientas renderizada, o `null` si no hay nada que mostrar
 */
export default function TableToolbar<TData>({
  searchable,
  searchPlaceholder,
  globalFilter,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  onClearAll,
  actions,
  selectedRows,
  selectedCount,
  onClearSelection,
}: TableToolbarProps<TData>) {
  const t = useTranslations("Table");

  const hasFilters = Boolean(filters && filters.length > 0);
  const hasActions = Boolean(actions && actions.length > 0);

  if (!searchable && !hasFilters && !hasActions) return null;

  return (
    <div className="table__toolbar">
      <div className="table__toolbar__left">
        {searchable && (
          <div className="table__search">
            <Input
              id="table-search"
              name="table-search"
              type="search"
              ariaLabel={t("search")}
              placeholder={searchPlaceholder ?? t("searchPlaceholder")}
              value={globalFilter}
              onChange={(e) => onSearchChange(e.target.value)}
              icon={SearchIcon}
              noTranslate
              className="input__md"
            />
          </div>
        )}

        {hasFilters && filters && (
          <Filters
            filters={filters}
            values={filterValues ?? {}}
            onChange={(key, value) => onFilterChange?.(key, value)}
            onClearAll={onClearAll}
          />
        )}
      </div>

      {hasActions && actions && (
        <TableBulkActions
          actions={actions}
          selectedRows={selectedRows}
          selectedCount={selectedCount}
          onClearSelection={onClearSelection}
        />
      )}
    </div>
  );
}
