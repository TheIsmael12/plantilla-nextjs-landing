"use client";

import "@/styles/04-components/ui/tables/table.scss";

import { useMemo, useState } from "react";

import {
  ColumnDef,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { useSorting } from "@/hooks/useSorting";
import { usePagination } from "@/hooks/usePagination";
import { useFilters } from "@/hooks/useFilters";

import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/constants/filters";

import TableBody from "@/components/ui/tables/TableBody";
import TableHead from "@/components/ui/tables/TableHead";
import TableToolbar from "@/components/ui/tables/TableToolbar";
import TablePagination from "@/components/ui/tables/TablePagination";
import IndeterminateCheckbox from "@/components/ui/tables/IndeterminateCheckbox";

import { TableProps } from "@/types/ui/tables/table";

/**
 * Tabla de datos genérica basada en TanStack Table: soporta orden, paginación
 * y filtro (controlados o internos), selección de filas (única o múltiple),
 * búsqueda y un menú de acciones sobre las filas seleccionadas. Este
 * componente concentra el estado y la instancia de TanStack Table; el
 * marcado se reparte entre `TableToolbar` (búsqueda/filtros/acciones
 * masivas), `TableHead`, `TableBody` y `TablePagination`.
 * @template TData
 * @template TValue
 * @param {TableProps<TData, TValue>} props - Propiedades del componente
 * @returns {JSX.Element} La tabla renderizada
 */
export default function Table<TData, TValue = unknown>({
  data,
  columns,
  getRowId,
  selectable = false,
  multiSelect = true,
  actions,
  initialPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  paginated = true,
  manualPagination = false,
  pagination: controlledPagination,
  rowCount,
  onPaginationChange,
  manualSorting = false,
  sorting: controlledSorting,
  onSortingChange,
  searchable = false,
  searchPlaceholder,
  manualFiltering = false,
  globalFilter: controlledGlobalFilter,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  onClearAll,
  isLoading = false,
  emptyMessage,
  className,
}: TableProps<TData, TValue>) {
  const t = useTranslations("Table");

  const internalPagination = usePagination({ initialPageSize });
  const internalSorting = useSorting();
  const internalFilters = useFilters();

  const pagination = controlledPagination ?? internalPagination.pagination;
  const sorting = controlledSorting ?? internalSorting.sorting;
  const globalFilter = controlledGlobalFilter ?? internalFilters.search;

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const tableColumns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    const translatedColumns = columns.map((column) =>
      typeof column.header === "string"
        ? { ...column, header: t(`Columns.${column.header}`) }
        : column,
    );

    if (!selectable) return translatedColumns;

    const selectionColumn: ColumnDef<TData, TValue> = {
      id: "select",
      size: 40,
      header: ({ table }) =>
        multiSelect ? (
          <IndeterminateCheckbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label={t("selectAll")}
          />
        ) : (
          // Sin selección múltiple no hay control de "seleccionar todas": la
          // celda queda vacía, pero el `<th>` necesita igualmente un nombre
          // accesible (regla axe `empty-table-header`).
          <span className="sr-only">{t("selectColumn")}</span>
        ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          radio={!multiSelect}
          onChange={row.getToggleSelectedHandler()}
          aria-label={t("selectRow")}
        />
      ),
    };

    return [selectionColumn, ...columns];
  }, [selectable, multiSelect, columns, t]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's API intentionally returns non-memoizable functions; not memoizing here is expected.
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, pagination, rowSelection, globalFilter },
    getRowId,
    manualSorting,
    manualPagination,
    manualFiltering,
    rowCount: manualPagination ? rowCount : undefined,
    enableRowSelection: selectable,
    enableMultiRowSelection: multiSelect,
    onRowSelectionChange: setRowSelection,
    /* v8 ignore next 6 -- defensivo: TanStack exige un `onGlobalFilterChange` emparejado con el `state.globalFilter` controlado, pero solo se invocaría si algo llamara a `table.setGlobalFilter` directamente. La búsqueda real de `Table` pasa siempre por `handleSearchChange`/`onSearchChange` (más abajo), nunca por la API de filtro global de TanStack, así que este handler es inalcanzable desde el componente público. */
    onGlobalFilterChange: (updater) => {
      const next = functionalUpdate(updater, globalFilter);
      if (controlledGlobalFilter === undefined) {
        internalFilters.setSearch(next);
      }
    },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting);
      if (controlledSorting === undefined) internalSorting.setSorting(next);
      onSortingChange?.(next);
    },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      if (controlledPagination === undefined) {
        internalPagination.setPagination(next);
      }
      onPaginationChange?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getPaginationRowModel:
      manualPagination || !paginated ? undefined : getPaginationRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
  });

  const handleSearchChange = (value: string) => {
    if (controlledGlobalFilter === undefined) {
      // `setSearch` ya resetea la página en la misma navegación (§`useFilters`),
      // así que cubre tanto el caso totalmente interno como el de paginación
      // controlada por el llamador pero búsqueda interna.
      internalFilters.setSearch(value);
    } else if (controlledPagination === undefined) {
      internalPagination.setPageIndex(0);
    }
    onSearchChange?.(value);
  };

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = selectedRows.length;

  const totalRecords = manualPagination ? (rowCount ?? 0) : data.length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = pagination.pageIndex + 1;

  return (
    <div className={`table__container${className ? ` ${className}` : ""}`}>
      <TableToolbar
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        globalFilter={globalFilter}
        onSearchChange={handleSearchChange}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        onClearAll={onClearAll}
        actions={actions}
        selectedRows={selectedRows}
        selectedCount={selectedCount}
        onClearSelection={() => setRowSelection({})}
      />

      <div className="table__scroll">
        <table className="table">
          <TableHead table={table} />
          <TableBody
            table={table}
            columnCount={tableColumns.length}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
          />
        </table>
      </div>

      {paginated && (
        <TablePagination
          currentPage={currentPage}
          pageCount={pageCount}
          totalRecords={totalRecords}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          onFirstPage={() => table.setPageIndex(0)}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
          onLastPage={() => table.setPageIndex(pageCount - 1)}
          onGoToPage={(page) => table.setPageIndex(page - 1)}
          pageSize={pagination.pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      )}
    </div>
  );
}
