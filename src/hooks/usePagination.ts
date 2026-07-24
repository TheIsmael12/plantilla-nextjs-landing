import { useState } from "react";

/**
 * Estado de paginación por defecto de {@link Table} cuando no se controla
 * externamente.
 * @param {{initialPageSize: number}} options Tamaño de página inicial
 * @returns {{pagination: {pageIndex: number, pageSize: number}, setPagination: Function, setPageIndex: Function, setPageSize: Function}} Estado de paginación y sus setters
 */
export function usePagination({ initialPageSize }: { initialPageSize: number }) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize });

  const setPageIndex = (pageIndex: number) => {
    setPagination((current) => ({ ...current, pageIndex }));
  };

  const setPageSize = (pageSize: number) => {
    setPagination((current) => ({ ...current, pageSize }));
  };

  return { pagination, setPagination, setPageIndex, setPageSize };
}
