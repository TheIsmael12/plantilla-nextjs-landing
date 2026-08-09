'use client';

import '@/styles/04-components/ui/lists/list.scss';

import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import type { PaginationState } from '@tanstack/react-table';

import ListSkeleton from '@/components/ui/lists/ListSkeleton';
import ListToolbar from '@/components/ui/lists/ListToolbar';
import TablePagination from '@/components/ui/tables/TablePagination';

import type { ListProps } from '@/types/ui/lists/list';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Listado genérico del portal: el equivalente a `Table` para los registros
 * que se presentan como tarjeta/fila libre (`renderItem`, normalmente un
 * `ListItem`) en vez de como fila de celdas con columnas. Reutiliza las
 * piezas transversales de `Table` para que ambos listados se comporten y se
 * lean igual: el buscador, el desplegable de filtros (`Filters`) y el pie de
 * paginación (`TablePagination`, mismo namespace `Table` de traducciones).
 *
 * A diferencia de `Table` en el portal, aquí NO hay fallback interno de
 * paginación/búsqueda no controlada: siempre se espera `pagination`/
 * `globalFilter` controlados desde el llamador (vía `useClientTableUrlState`
 * u otro estado propio), igual que ya hacen todas las `*Table.tsx` de
 * comunidad — por eso, a diferencia de la versión de intranet, este
 * componente no gestiona ningún hook interno de URL.
 * @template TData - Tipo de cada elemento de `items`
 * @param {ListProps<TData>} props - Propiedades del componente
 * @returns {JSX.Element} El listado renderizado
 */
export default function List<TData>({
  items,
  renderItem,
  getItemId,
  searchable = false,
  searchPlaceholder,
  globalFilter = '',
  onSearchChange,
  manualFiltering = true,
  searchAccessor,
  filters,
  filterValues,
  onFilterChange,
  onClearAll,
  toolbarActions,
  paginated = true,
  manualPagination = true,
  pagination,
  rowCount,
  onPaginationChange,
  initialPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isLoading = false,
  emptyMessage,
  ariaLabel,
  className,
  listClassName,
}: ListProps<TData>) {
  const t = useTranslations('Table');

  const resolvedPagination: PaginationState = pagination ?? {
    pageIndex: 0,
    pageSize: initialPageSize,
  };

  // En modo delegado la API ya ha filtrado: `items` se respeta tal cual. En
  // modo en memoria solo se filtra si el llamador ha declarado sobre qué
  // texto buscar (`searchAccessor`).
  const filteredItems = useMemo(() => {
    if (manualFiltering || !searchAccessor) return items;

    const term = globalFilter.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => searchAccessor(item).toLowerCase().includes(term));
  }, [items, globalFilter, manualFiltering, searchAccessor]);

  const totalRecords = manualPagination ? (rowCount ?? 0) : filteredItems.length;
  const pageCount = paginated ? Math.max(Math.ceil(totalRecords / resolvedPagination.pageSize), 1) : 1;

  const pageIndex = Math.min(Math.max(resolvedPagination.pageIndex, 0), pageCount - 1);
  const currentPage = pageIndex + 1;

  const visibleItems =
    paginated && !manualPagination
      ? filteredItems.slice(
          pageIndex * resolvedPagination.pageSize,
          pageIndex * resolvedPagination.pageSize + resolvedPagination.pageSize,
        )
      : filteredItems;

  const goToPage = (page: number) =>
    onPaginationChange?.({ pageIndex: page - 1, pageSize: resolvedPagination.pageSize });

  return (
    <div className={`list__container${className ? ` ${className}` : ''}`}>
      <ListToolbar
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        globalFilter={globalFilter}
        onSearchChange={(value) => onSearchChange?.(value)}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        onClearAll={onClearAll}
        actions={toolbarActions}
      />

      {isLoading ? (
        <ListSkeleton items={Math.max(visibleItems.length, 3)} showToolbar={false} />
      ) : visibleItems.length === 0 ? (
        <p className="list__empty">{emptyMessage ?? t('noResults')}</p>
      ) : (
        <ul className={`list${listClassName ? ` ${listClassName}` : ''}`} aria-label={ariaLabel}>
          {visibleItems.map((item, index) => (
            <li key={getItemId?.(item, index) ?? index} className="list__row">
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      )}

      {paginated && (
        <TablePagination
          currentPage={currentPage}
          pageCount={pageCount}
          totalRecords={totalRecords}
          canPreviousPage={currentPage > 1}
          canNextPage={currentPage < pageCount}
          onFirstPage={() => goToPage(1)}
          onPreviousPage={() => goToPage(currentPage - 1)}
          onNextPage={() => goToPage(currentPage + 1)}
          onLastPage={() => goToPage(pageCount)}
          onGoToPage={goToPage}
          pageSize={resolvedPagination.pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={(size) => onPaginationChange?.({ pageIndex: 0, pageSize: size })}
        />
      )}
    </div>
  );
}
