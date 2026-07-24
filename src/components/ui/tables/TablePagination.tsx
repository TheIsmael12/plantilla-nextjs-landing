"use client";

import "@/styles/04-components/ui/tables/table.scss";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import Select from "@/components/ui/inputs/Select";

import { TablePaginationProps } from "@/types/ui/tables/table";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

const PAGE_WINDOW_SIZE = 5;

/** Calcula la ventana de números de página a mostrar, centrada en la página actual. */
function getPageWindow(current: number, total: number, size: number) {
  if (total <= size) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(size / 2));
  let end = start + size - 1;

  if (end > total) {
    end = total;
    start = end - size + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Pie de tabla con información de página, controles de paginación (con
 * ventana de páginas centrada en la actual) y selector de tamaño de página.
 * @param {TablePaginationProps} props - Propiedades del componente
 * @returns {JSX.Element} El pie de paginación renderizado
 */
export default function TablePagination({
  currentPage,
  pageCount,
  totalRecords,
  canPreviousPage,
  canNextPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onGoToPage,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: TablePaginationProps) {
  const t = useTranslations("Table");

  const resolvedPageSizeOptions = useMemo(() => {
    const options = new Set(pageSizeOptions);
    options.add(pageSize);
    return Array.from(options).sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  return (
    <div className="table__footer">
      <span className="table__footer__info">
        {t.rich("pageInfo", {
          strong: (chunks) => <strong>{chunks}</strong>,
          page: currentPage,
          pageCount,
          total: totalRecords,
        })}
      </span>

      <div className="table__pagination">
        <button
          type="button"
          aria-label={t("firstPage")}
          disabled={!canPreviousPage}
          onClick={onFirstPage}
        >
          <ChevronsLeftIcon />
        </button>
        <button
          type="button"
          aria-label={t("previousPage")}
          disabled={!canPreviousPage}
          onClick={onPreviousPage}
        >
          <ChevronLeftIcon />
        </button>
        {getPageWindow(currentPage, pageCount, PAGE_WINDOW_SIZE).map(
          (pageNum) => (
            <button
              key={pageNum}
              type="button"
              className={`table__pagination__page${
                pageNum === currentPage
                  ? " table__pagination__page--active"
                  : ""
              }`}
              aria-label={t("goToPage", { page: pageNum })}
              aria-current={pageNum === currentPage ? "page" : undefined}
              onClick={() => onGoToPage(pageNum)}
            >
              {pageNum}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label={t("nextPage")}
          disabled={!canNextPage}
          onClick={onNextPage}
        >
          <ChevronRightIcon />
        </button>
        <button
          type="button"
          aria-label={t("lastPage")}
          disabled={!canNextPage}
          onClick={onLastPage}
        >
          <ChevronsRightIcon />
        </button>
      </div>

      <label className="table__page-size">
        {t("rowsPerPage")}
        <Select
          size="sm"
          value={String(pageSize)}
          options={resolvedPageSizeOptions.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          onChange={(value: string) => onPageSizeChange(Number(value))}
          className="table__page-size__select"
        />
      </label>
    </div>
  );
}
