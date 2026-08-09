'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { SendIcon, XIcon } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

import { useClientTableUrlState } from '@/hooks/useClientTableUrlState';
import { formatBillingDate } from '@/utils/billingFormatUtils';
import { INVITATION_STATUS_VARIANTS } from '@/utils/communityFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import Table from '@/components/ui/tables/Table';

import type { ResidentInvitation } from '@/types/client-portal/community';
import type { PaginatedResult } from '@/types/responses';

const INVITATIONS_PER_PAGE = 10;

interface InvitationsTableProps {
  data: PaginatedResult<ResidentInvitation>;
  locale: string;
  isActionPending: boolean;
  onResend: (invitation: ResidentInvitation) => void;
  onRevoke: (invitation: ResidentInvitation) => void;
}

/**
 * Tabla de invitaciones pendientes/cerradas de una comunidad, con su propio
 * namespace de query params (`invitationsPage`/`invitationsLimit`/
 * `invitationsSortBy`/`invitationsSortOrder`/`invitationsQ`) para no pisar la
 * paginación/orden/búsqueda de `ResidentsTable`, con la que comparte pantalla.
 * @param {InvitationsTableProps} props - Página actual de invitaciones, locale y handlers de reenvío/revocación (delegados a `ResidentsManager`)
 * @returns {JSX.Element} La tabla de invitaciones renderizada
 */
export default function InvitationsTable({
  data,
  locale,
  isActionPending,
  onResend,
  onRevoke,
}: InvitationsTableProps) {
  const t = useTranslations('Views.ClientArea.Communities');
  const tCommon = useTranslations('Views.ClientArea.Common');

  const { pagination, sorting, search, setPagination, setSorting, setSearch, isPending } =
    useClientTableUrlState({
      initialPageSize: INVITATIONS_PER_PAGE,
      pageParam: 'invitationsPage',
      limitParam: 'invitationsLimit',
      sortByParam: 'invitationsSortBy',
      sortOrderParam: 'invitationsSortOrder',
      searchParam: 'invitationsQ',
    });

  const columns = useMemo<ColumnDef<ResidentInvitation>[]>(
    () => [
      {
        id: 'email',
        accessorKey: 'email',
        header: () => t('Residents.emailsLabel'),
        cell: ({ row }) => (
          <div>
            {row.original.name && (
              <>
                <strong>{row.original.name}</strong>
                <br />
              </>
            )}
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
          getValue<string | null>() ?? (
            <span className="community-table__muted">{t('Residents.noUnit')}</span>
          ),
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: () => t('Residents.roleColumn'),
        enableSorting: false,
        cell: ({ getValue }) => t(`ResidentRole.${getValue<ResidentInvitation['role']>()}`),
      },
      {
        id: 'keyrings',
        header: () => t('Residents.invitedKeyrings'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.keyringNames.length > 0 ? (
            row.original.keyringNames.join(', ')
          ) : (
            <span className="community-table__muted">{tCommon('notAvailable')}</span>
          ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => t('Residents.statusColumn'),
        enableSorting: false,
        cell: ({ getValue }) => (
          <Badge
            variant={INVITATION_STATUS_VARIANTS[getValue<ResidentInvitation['status']>()]}
            text={t(`InvitationStatus.${getValue<ResidentInvitation['status']>()}`)}
          />
        ),
      },
      {
        id: 'expiresAt',
        accessorKey: 'expiresAt',
        header: () => t('Residents.expiresAt'),
        cell: ({ getValue }) =>
          formatBillingDate(getValue<string>(), locale, tCommon('notAvailable')),
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.status === 'PENDING' && (
            <div className="community-table__actions">
              <Button
                size="sm"
                variant="outline"
                ariaLabel="resend"
                onClick={() => onResend(row.original)}
                disabled={isActionPending}
              >
                <SendIcon />
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
    [t, tCommon, locale, isActionPending, onResend, onRevoke],
  );

  return (
    <Table
      data={data.items}
      columns={columns}
      getRowId={(invitation) => invitation.id}
      manualPagination
      pagination={pagination}
      rowCount={data.pagination.totalItems}
      onPaginationChange={setPagination}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      searchable
      searchPlaceholder={t('Residents.invitationsSearchPlaceholder')}
      manualFiltering
      globalFilter={search}
      onSearchChange={setSearch}
      isLoading={isPending}
      emptyMessage={t('Residents.invitationsEmpty')}
    />
  );
}
