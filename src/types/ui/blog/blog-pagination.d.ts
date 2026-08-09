interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  /** Query params activos (p. ej. `category`), preservados al cambiar de página. */
  searchParams?: Record<string, string | undefined>;
}
