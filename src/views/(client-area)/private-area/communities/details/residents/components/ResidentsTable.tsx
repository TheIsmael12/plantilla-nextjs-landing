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
 * @param {ResidentsTableProps} props - Página actual de vecinos y handlers de edición/revocación (delegados a `CommunitiesResidentsPanel`, dueño de los modales)
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

  /**
   * Las otras viviendas de cada persona dentro de esta página.
   *
   * Una pertenencia es de **una** vivienda, así que el propietario de tres pisos sale en tres filas. Sin
   * decirlo, esas tres filas parecen tres vecinos con el mismo nombre, y quien reparte llaves o revoca un
   * acceso no tiene forma de saber que está tocando a la misma persona.
   *
   * Se agrupa por correo porque es lo que identifica a la cuenta —el nombre se repite en un edificio— y se
   * calcula sobre la página que hay en pantalla: el listado viene paginado, así que si alguien tiene una
   * vivienda en esta página y otra en la siguiente, aquí solo se puede contar la que se ve. Es mejor decir
   * «también en el 5.º A» que no decir nada.
   */
  const otherUnits = useMemo(() => {
    const byEmail = new Map<string, string[]>();

    for (const resident of data.items) {
      if (!resident.communityUnitCode) continue;

      byEmail.set(resident.email, [
        ...(byEmail.get(resident.email) ?? []),
        resident.communityUnitCode,
      ]);
    }

    return byEmail;
  }, [data.items]);

  const columns = useMemo<ColumnDef<PortalResident>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: () => t('Residents.title'),
        cell: ({ row }) => {
          const others = (otherUnits.get(row.original.email) ?? []).filter(
            (code) => code !== row.original.communityUnitCode,
          );

          return (
            <div>
              <strong>{row.original.name}</strong>
              <br />
              <span className="community-table__muted">{row.original.email}</span>

              {/* Solo cuando de verdad tiene más de una: en el caso normal no se dice nada. */}
              {others.length > 0 && (
                <>
                  <br />
                  <span className="community-table__muted">
                    {t('Residents.alsoInUnits', { units: others.join(', ') })}
                  </span>
                </>
              )}
            </div>
          );
        },
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
    [t, isActionPending, onEdit, onRevoke, otherUnits],
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
