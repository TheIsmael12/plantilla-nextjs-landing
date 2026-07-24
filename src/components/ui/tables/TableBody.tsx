import { flexRender } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { Loader2Icon, SearchXIcon } from "lucide-react";

import type { TableBodyProps } from "@/types/ui/tables/table";

/**
 * Cuerpo de {@link Table}: estado de carga, estado vacío, o las filas reales
 * con sus celdas renderizadas vía `flexRender`.
 * @template TData - Tipo de fila de la tabla
 * @param {TableBodyProps<TData>} props - Propiedades del componente
 * @returns {JSX.Element} El `<tbody>` renderizado
 */
export default function TableBody<TData>({
  table,
  columnCount,
  isLoading,
  emptyMessage,
}: TableBodyProps<TData>) {
  const t = useTranslations("Table");

  if (isLoading) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount}>
            <div className="table__state table__state--loading">
              <Loader2Icon />
              {t("loading")}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount}>
            <div className="table__state">
              <SearchXIcon />
              {emptyMessage ?? t("noResults")}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((row) => (
        <tr key={row.id} className={row.getIsSelected() ? "table__row--selected" : ""}>
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
