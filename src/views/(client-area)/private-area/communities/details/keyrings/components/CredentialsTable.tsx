'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCardIcon, XIcon } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

import { useClientTableUrlState } from '@/hooks/useClientTableUrlState';
import { CREDENTIAL_STATUS_VARIANTS, formatCommunityDateTime } from '@/utils/communityFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import Table from '@/components/ui/tables/Table';

import type { LockCredential } from '@/types/client-portal/community';
import type { PaginatedResult } from '@/types/responses';

const CREDENTIALS_PER_PAGE = 10;

interface CredentialsTableProps {
  data: PaginatedResult<LockCredential>;
  locale: string;
  isActionPending: boolean;
  onEnroll: (credential: LockCredential) => void;
  onRevoke: (credential: LockCredential) => void;
}

/**
 * Tabla de credenciales de acceso de una comunidad, con paginación, orden y
 * búsqueda delegados al servidor y sincronizados con la URL vía
 * `useClientTableUrlState` (namespace `credentials*`, distinto del de
 * `KeyringsTable`, con la que comparte pantalla).
 * @param {CredentialsTableProps} props - Página actual de credenciales, locale y handlers de enrolado/revocación (delegados a `CredentialsSection`, dueño de los modales)
 * @returns {JSX.Element} La tabla de credenciales renderizada
 */
export default function CredentialsTable({
  data,
  locale,
  isActionPending,
  onEnroll,
  onRevoke,
}: CredentialsTableProps) {
  const t = useTranslations('Views.ClientArea.Communities');
  const tCommon = useTranslations('Views.ClientArea.Common');

  const { pagination, sorting, search, setPagination, setSorting, setSearch, isPending } =
    useClientTableUrlState({
      initialPageSize: CREDENTIALS_PER_PAGE,
      pageParam: 'credentialsPage',
      limitParam: 'credentialsLimit',
      sortByParam: 'credentialsSortBy',
      sortOrderParam: 'credentialsSortOrder',
      searchParam: 'credentialsQ',
    });

  const columns = useMemo<ColumnDef<LockCredential>[]>(
    () => [
      {
        id: 'label',
        accessorKey: 'label',
        header: () => t('Keyrings.CredentialsSection.labelLabel'),
        cell: ({ row }) => (
          <>
            <strong>{row.original.label}</strong>
            {row.original.canBypassSchedule && (
              <>
                {' '}
                <Badge variant="warning" text={t('Keyrings.CredentialsSection.bypassLabel')} />
              </>
            )}
          </>
        ),
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: () => t('Keyrings.CredentialsSection.typeColumn'),
        cell: ({ getValue }) => t(`CredentialType.${getValue<LockCredential['type']>()}`),
      },
      {
        id: 'targetName',
        accessorKey: 'targetName',
        header: () => t('Keyrings.CredentialsSection.targetColumn'),
        enableSorting: false,
        // Nombre de la puerta o del llavero ya resuelto en el backend, no una
        // columna real de `LockCredential`: no ordenable.
        cell: ({ getValue }) =>
          getValue<string | null>() ?? <span className="community-table__muted">—</span>,
      },
      {
        id: 'holder',
        header: () => t('Keyrings.CredentialsSection.holderColumn'),
        enableSorting: false,
        cell: ({ row }) => (
          <>
            {row.original.residentName ?? row.original.issuedForName ?? (
              <span className="community-table__muted">
                {t('Keyrings.CredentialsSection.noResident')}
              </span>
            )}
            {row.original.residentUnitCode && (
              <>
                <br />
                <span className="community-table__muted">{row.original.residentUnitCode}</span>
              </>
            )}
          </>
        ),
      },
      {
        id: 'validUntil',
        accessorKey: 'validUntil',
        header: () => t('Keyrings.CredentialsSection.validUntilLabel'),
        cell: ({ getValue }) =>
          formatCommunityDateTime(getValue<string | null>(), locale, tCommon('notAvailable')),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => t('Keyrings.CredentialsSection.statusColumn'),
        cell: ({ row }) => (
          <>
            <Badge
              variant={CREDENTIAL_STATUS_VARIANTS[row.original.status]}
              text={t(`CredentialStatus.${row.original.status}`)}
            />
            <br />
            <span className="community-table__muted">
              {row.original.pendingLocks > 0
                ? t('Keyrings.CredentialsSection.pendingLocks', {
                    count: row.original.pendingLocks,
                  })
                : t('Keyrings.CredentialsSection.syncedLocks')}
            </span>
          </>
        ),
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="community-table__actions">
            {row.original.type === 'NFC_CARD' && (
              <Button
                size="sm"
                variant="outline"
                ariaLabel="enroll"
                onClick={() => onEnroll(row.original)}
                disabled={isActionPending}
              >
                <CreditCardIcon />
              </Button>
            )}
            {row.original.status !== 'REVOKED' && (
              <Button
                size="sm"
                variant="outline"
                ariaLabel="revoke"
                onClick={() => onRevoke(row.original)}
                disabled={isActionPending}
              >
                <XIcon />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [t, tCommon, locale, isActionPending, onEnroll, onRevoke],
  );

  return (
    <Table
      data={data.items}
      columns={columns}
      getRowId={(credential) => credential.id}
      manualPagination
      pagination={pagination}
      rowCount={data.pagination.totalItems}
      onPaginationChange={setPagination}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      searchable
      searchPlaceholder={t('Keyrings.CredentialsSection.searchPlaceholder')}
      manualFiltering
      globalFilter={search}
      onSearchChange={setSearch}
      isLoading={isPending}
      emptyMessage={t('Keyrings.CredentialsSection.empty')}
    />
  );
}
