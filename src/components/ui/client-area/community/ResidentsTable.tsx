'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PencilIcon, XIcon } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

import { useClientTableUrlState } from '@/hooks/useClientTableUrlState';
import { MEMBERSHIP_STATUS_VARIANTS } from '@/utils/communityFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import Table from '@/components/ui/tables/Table';

import type { PortalResident } from '@/types/client-portal/community';
import type { PaginatedResult } from '@/types/responses';

const RESIDENTS_PER_PAGE = 10;

interface ResidentsTableProps {
  data: PaginatedResult<PortalResident>;
  isActionPending: boolean;
  onEdit: (resident: PortalResident) => void;
  onRevoke: (resident: PortalResident) => void;
}

/**
 * Tabla de vecinos de una comunidad, con paginación, orden y búsqueda
 * delegados al servidor y sincronizados con la URL (`page`/`limit`/`sortBy`/
 * `sortOrder`/`q`, namespace por defecto, distinto del de `InvitationsTable`
 * que usa el prefijo `invitations*` en la misma pantalla).
 * @param {ResidentsTableProps} props - Página actual de vecinos y handlers de edición/revocación (delegados a `ResidentsManager`, dueño de los modales)
 * @returns {JSX.Element} La tabla de vecinos renderizada
 */
export default function ResidentsTable({
  data,
  isActionPending,
  onEdit,
  onRevoke,
}: ResidentsTableProps) {
  const t = useTranslations('Views.ClientArea.Communities');

  const { pagination, sorting, search, setPagination, setSorting, setSearch, isPending } =
    useClientTableUrlState({ initialPageSize: RESIDENTS_PER_PAGE });

  const columns = useMemo<ColumnDef<PortalResident>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: () => t('Residents.title'),
        cell: ({ row }) => (
          <div>
            <strong>{row.original.name}</strong>
            <br />
            <span className="community-table__muted">{row.original.email}</span>
          </div>
        ),
      },
      {
        id: 'communityUnitCode',
        accessorKey: 'communityUnitCode',
        header: () => t('Residents.unitColumn'),
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue<string | null | undefined>() ?? (
            <span className="community-table__muted">{t('Residents.noUnit')}</span>
          ),
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: () => t('Residents.roleColumn'),
        enableSorting: false,
        cell: ({ getValue }) => t(`ResidentRole.${getValue<PortalResident['role']>()}`),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => t('Residents.statusColumn'),
        enableSorting: false,
        cell: ({ getValue }) => (
          <Badge
            variant={MEMBERSHIP_STATUS_VARIANTS[getValue<PortalResident['status']>()]}
            text={t(`MembershipStatus.${getValue<PortalResident['status']>()}`)}
          />
        ),
      },
      {
        id: 'canSignIn',
        accessorKey: 'canSignIn',
        header: () => t('Residents.accountColumn'),
        enableSorting: false,
        cell: ({ getValue }) => (
          <Badge
            variant={getValue<boolean>() ? 'success' : 'danger'}
            text={getValue<boolean>() ? t('Residents.canSignIn') : t('Residents.cannotSignIn')}
          />
        ),
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="community-table__actions">
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
              ariaLabel="revoke"
              onClick={() => onRevoke(row.original)}
              disabled={isActionPending}
            >
              <XIcon />
            </Button>
          </div>
        ),
      },
    ],
    [t, isActionPending, onEdit, onRevoke],
  );

  return (
    <Table
      data={data.items}
      columns={columns}
      getRowId={(resident) => resident.membershipId}
      manualPagination
      pagination={pagination}
      rowCount={data.pagination.totalItems}
      onPaginationChange={setPagination}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      searchable
      searchPlaceholder={t('Residents.searchPlaceholder')}
      manualFiltering
      globalFilter={search}
      onSearchChange={setSearch}
      isLoading={isPending}
      emptyMessage={t('Residents.emptyDescription')}
    />
  );
}
