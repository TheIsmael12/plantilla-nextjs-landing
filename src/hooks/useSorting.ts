import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";

/**
 * Estado de orden por defecto de {@link Table} cuando no se controla
 * externamente mediante la prop `sorting`.
 * @returns {{sorting: SortingState, setSorting: React.Dispatch<React.SetStateAction<SortingState>>}} Estado de orden y su setter
 */
export function useSorting() {
  const [sorting, setSorting] = useState<SortingState>([]);

  return { sorting, setSorting };
}
