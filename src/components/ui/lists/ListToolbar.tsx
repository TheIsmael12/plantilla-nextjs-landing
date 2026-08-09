'use client';

import { useTranslations } from 'next-intl';
import { SearchIcon } from 'lucide-react';

import Input from '@/components/ui/inputs/Input';
import Filters from '@/components/ui/tables/Filters';

import type { ListToolbarProps } from '@/types/ui/lists/list';

/**
 * Barra de herramientas de {@link List}: búsqueda y filtros (`Filters`, el
 * mismo desplegable que usa `Table`) a la izquierda, acciones libres de la
 * vista a la derecha (p. ej. el botón de "Nuevo…"). A diferencia de
 * `TableToolbar` no hay acciones masivas: una lista no tiene selección de
 * filas. No se renderiza nada si ninguna de las tres partes aplica.
 * @param {ListToolbarProps} props - Propiedades del componente
 * @returns {JSX.Element | null} La barra de herramientas renderizada, o `null` si no hay nada que mostrar
 */
export default function ListToolbar({
  searchable,
  searchPlaceholder,
  globalFilter,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  onClearAll,
  actions,
}: ListToolbarProps) {
  const t = useTranslations('Table');

  const hasFilters = Boolean(filters && filters.length > 0);

  if (!searchable && !hasFilters && !actions) return null;

  return (
    <div className="list__toolbar">
      <div className="list__toolbar__left">
        {searchable && (
          <div className="list__search">
            <Input
              id="list-search"
              name="list-search"
              type="search"
              ariaLabel={t('search')}
              placeholder={searchPlaceholder ?? t('searchPlaceholder')}
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

      {actions && <div className="list__toolbar__right">{actions}</div>}
    </div>
  );
}
