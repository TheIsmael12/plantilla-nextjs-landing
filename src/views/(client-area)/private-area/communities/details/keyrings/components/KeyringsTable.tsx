'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

import { useClientTableUrlState } from '@/hooks/useClientTableUrlState';

import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import Table from '@/components/ui/tables/Table';

import type { LockGroup } from '@/types/client-portal/community';
import type { PaginatedResult } from '@/types/responses';

const KEYRINGS_PER_PAGE = 10;

interface KeyringsTableProps {
  data: PaginatedResult<LockGroup>;
  isActionPending: boolean;
  onEdit: (keyring: LockGroup) => void;
  onDelete: (keyring: LockGroup) => void;
  /** Abre la lista de quién tiene una llave viva de este llavero. */
  onViewHolders: (keyring: LockGroup) => void;
}

/**
 * Tabla de llaveros de una comunidad, con paginación, orden y búsqueda
 * delegados al servidor y sincronizados con la URL vía `useClientTableUrlState`
 * (namespace por defecto, distinto del de `CredentialsTable`, que usa el
 * prefijo `credentials*` en la misma pantalla).
 * @param {KeyringsTableProps} props - Página actual de llaveros y handlers de edición/eliminación (delegados a `KeyringsSection`, dueño de los modales)
 * @returns {JSX.Element} La tabla de llaveros renderizada
 */
export default function KeyringsTable({
  data,
  isActionPending,
  onEdit,
  onDelete,
  onViewHolders,
}: KeyringsTableProps) {
  const t = useTranslations('Views.ClientArea.Communities');

  const { pagination, sorting, search, setPagination, setSorting, setSearch, isPending } =
    useClientTableUrlState({ initialPageSize: KEYRINGS_PER_PAGE });

  const columns = useMemo<ColumnDef<LockGroup>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: () => t('Keyrings.nameLabel'),
        cell: ({ row }) => (
          <div>
            <strong>{row.original.name}</strong>
            {row.original.isDefault && (
              <>
                {' '}
                <Badge variant="info" text={t('Keyrings.isDefault')} />
              </>
            )}
            {row.original.description && (
              <>
                <br />
                <span className="community-table__muted">{row.original.description}</span>
              </>
            )}
          </div>
        ),
      },
      {
        id: 'permissionRules',
        header: () => t('Keyrings.rulesLabel'),
        enableSorting: false,
        // Filas hijas, no una columna de `LockGroup`: no ordenable.
        cell: ({ row }) =>
          row.original.permissionRules.length > 0 ? (
            row.original.permissionRules
              .map((rule) =>
                rule.target === 'EVERYTHING'
                  ? t('Keyrings.Target.EVERYTHING')
                  : (rule.siteName ?? rule.lockName ?? ''),
              )
              .filter(Boolean)
              .join(', ')
          ) : (
            <span className="community-table__muted">—</span>
          ),
      },
      {
        id: 'memberCount',
        accessorKey: 'memberCount',
        header: () => t('Keyrings.memberCount'),
        enableSorting: false,
        // Campo calculado (cuánta gente lo tiene), no una columna real de la
        // entidad: no ordenable.
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="community-table__actions">
            {/* Consultar quién tiene llave va primero y sin deshabilitar: es la pregunta que se hace todos
                los días («¿quién puede entrar al garaje?»), y leer no choca con una escritura en marcha. */}
            <Button
              size="sm"
              variant="outline"
              ariaLabel="viewHolders"
              onClick={() => onViewHolders(row.original)}
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
    [t, isActionPending, onEdit, onDelete, onViewHolders],
  );

  return (
    <Table
      data={data.items}
      columns={columns}
      getRowId={(keyring) => keyring.id}
      manualPagination
      pagination={pagination}
      rowCount={data.pagination.totalItems}
      onPaginationChange={setPagination}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      searchable
      searchPlaceholder={t('Keyrings.searchPlaceholder')}
      manualFiltering
      globalFilter={search}
      onSearchChange={setSearch}
      isLoading={isPending}
      emptyMessage={t('Keyrings.emptyDescription')}
    />
  );
}
