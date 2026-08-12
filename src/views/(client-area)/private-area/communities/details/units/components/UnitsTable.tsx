'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

import { useClientTableUrlState } from '@/hooks/useClientTableUrlState';

import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import Table from '@/components/ui/tables/Table';

import type { CommunityUnit } from '@/types/client-portal/community';
import type { PaginatedResult } from '@/types/responses';

const UNITS_PER_PAGE = 10;

interface UnitsTableProps {
  data: PaginatedResult<CommunityUnit>;
  isActionPending: boolean;
  onEdit: (unit: CommunityUnit) => void;
  onDelete: (unit: CommunityUnit) => void;
  /** Abre la lista de vecinos de la unidad. */
  onViewResidents: (unit: CommunityUnit) => void;
}

/**
 * Tabla de unidades del edificio, con paginación, orden y búsqueda delegados
 * al servidor y sincronizados con la URL vía `useClientTableUrlState`. `data`
 * es siempre la página actual, ya filtrada/ordenada por el backend.
 * @param {UnitsTableProps} props - Página actual de unidades y handlers de edición/eliminación (delegados a `CommunitiesUnitsPanel`, dueño de los modales)
 * @returns {JSX.Element} La tabla de unidades renderizada
 */
export default function UnitsTable({
  data,
  isActionPending,
  onEdit,
  onDelete,
  onViewResidents,
}: UnitsTableProps) {
  const t = useTranslations('Views.ClientArea.Communities');

  const { pagination, sorting, search, setPagination, setSorting, setSearch, isPending } =
    useClientTableUrlState({ initialPageSize: UNITS_PER_PAGE });

  const columns = useMemo<ColumnDef<CommunityUnit>[]>(
    () => [
      {
        id: 'code',
        accessorKey: 'code',
        header: () => t('Units.codeLabel'),
        cell: ({ getValue }) => <strong>{getValue<string>()}</strong>,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: () => t('Units.typeLabel'),
        cell: ({ getValue }) => t(`UnitType.${getValue<CommunityUnit['type']>()}`),
      },
      {
        id: 'block',
        accessorKey: 'block',
        header: () => t('Units.blockLabel'),
        cell: ({ getValue }) =>
          getValue<string | null>() ?? <span className="community-table__muted">—</span>,
      },
      {
        id: 'floor',
        accessorKey: 'floor',
        header: () => t('Units.floorLabel'),
        cell: ({ getValue }) =>
          getValue<string | null>() ?? <span className="community-table__muted">—</span>,
      },
      {
        id: 'door',
        accessorKey: 'door',
        header: () => t('Units.doorLabel'),
        cell: ({ getValue }) =>
          getValue<string | null>() ?? <span className="community-table__muted">—</span>,
      },
      {
        id: 'activeResidents',
        accessorKey: 'activeResidents',
        header: () => t('Units.residentsColumn'),
        enableSorting: false,
        // Campo calculado (recuento de pertenencias activas), no una columna
        // real de `CommunityUnit`: `applySort` (whitelist por metadata de
        // TypeORM) no lo aceptaría como `sortBy`.
      },
      {
        id: 'isActive',
        accessorKey: 'isActive',
        header: () => t('Residents.statusColumn'),
        cell: ({ getValue }) => (
          <Badge
            variant={getValue<boolean>() ? 'success' : 'neutral'}
            text={getValue<boolean>() ? t('Units.active') : t('Units.inactive')}
          />
        ),
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="community-table__actions">
            {/* El ojo primero: mirar quién vive aquí se hace a menudo, y editar o borrar es lo
                excepcional. No lo deshabilita `isActionPending`, porque consultar no choca con una
                escritura en marcha. */}
            <Button
              size="sm"
              variant="outline"
              ariaLabel="viewResidents"
              onClick={() => onViewResidents(row.original)}
            >
              <EyeIcon />
            </Button>
            <Button
              size="sm"
              variant="outline"
              ariaLabel="edit"
              onClick={() => onEdit(row.original)}
              disabled={isActionPending}
            >
              <PencilIcon />
            </Button>
            <Button
              size="sm"
              variant="outline"
              ariaLabel="delete"
              onClick={() => onDelete(row.original)}
              disabled={isActionPending}
            >
              <TrashIcon />
            </Button>
          </div>
        ),
      },
    ],
    [t, isActionPending, onEdit, onDelete, onViewResidents],
  );

  return (
    <Table
      data={data.items}
      columns={columns}
      getRowId={(unit) => unit.id}
      manualPagination
      pagination={pagination}
      rowCount={data.pagination.totalItems}
      onPaginationChange={setPagination}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      searchable
      searchPlaceholder={t('Units.searchPlaceholder')}
      manualFiltering
      globalFilter={search}
      onSearchChange={setSearch}
      isLoading={isPending}
      emptyMessage={t('Units.emptyDescription')}
    />
  );
}
