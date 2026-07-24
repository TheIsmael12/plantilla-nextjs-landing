import { flexRender } from "@tanstack/react-table";

import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from "lucide-react";

import type { TableHeadProps } from "@/types/ui/tables/table";

/**
 * Cabecera de {@link Table}: un `<th>` por columna visible, con botón de
 * orden (flecha según `getIsSorted()`) cuando la columna lo permite.
 * @template TData - Tipo de fila de la tabla
 * @param {TableHeadProps<TData>} props - Propiedades del componente
 * @returns {JSX.Element} El `<thead>` renderizado
 */
export default function TableHead<TData>({ table }: TableHeadProps<TData>) {
  return (
    <thead className="table__head">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const sortDir = header.column.getIsSorted();

            const headerContent =
              !header.isPlaceholder &&
              flexRender(header.column.columnDef.header, header.getContext());

            return (
              <th key={header.id} colSpan={header.colSpan}>
                {headerContent &&
                  (canSort ? (
                    <button
                      type="button"
                      className="table__header table__header--sortable"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {headerContent}
                      {sortDir === "asc" ? (
                        <ChevronUpIcon className="table__sort-icon" />
                      ) : sortDir === "desc" ? (
                        <ChevronDownIcon className="table__sort-icon" />
                      ) : (
                        <ChevronsUpDownIcon className="table__sort-icon table__sort-icon--idle" />
                      )}
                    </button>
                  ) : (
                    <div className="table__header">{headerContent}</div>
                  ))}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
