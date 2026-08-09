'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import type { ColumnDef } from '@tanstack/react-table';

import { useClientTableUrlState } from '@/hooks/useClientTableUrlState';
import { formatBillingDate } from '@/utils/billingFormatUtils';
import { INCIDENT_PRIORITY_VARIANTS, INCIDENT_STATUS_VARIANTS } from '@/utils/communityFormatUtils';
import { Link, resolveDetailHref } from '@/i18n/navigation';

import Badge from '@/components/ui/buttons/Badge';
import Table from '@/components/ui/tables/Table';

import type { CommunityIncident, IncidentStatus } from '@/types/client-portal/community';
import type { PaginatedResult } from '@/types/responses';
import type { Filter } from '@/types/ui/tables/table';

const INCIDENTS_PER_PAGE = 10;

interface IncidentsTableProps {
  data: PaginatedResult<CommunityIncident>;
  locale: string;
  statusOptions: IncidentStatus[];
}

/**
 * Tabla de incidencias del portal, con paginación, orden y filtro por estado
 * delegados al servidor y sincronizados con la URL vía `useClientTableUrlState`.
 * `data` es siempre la página actual, ya filtrada/ordenada por el backend.
 * @param {IncidentsTableProps} props - Página actual de incidencias, locale y opciones del filtro de estado
 * @returns {JSX.Element} La tabla de incidencias renderizada
 */
export default function IncidentsTable({ data, locale, statusOptions }: IncidentsTableProps) {
  const t = useTranslations('Views.ClientArea.Communities.Incidents');
  const tCommunities = useTranslations('Views.ClientArea.Communities');
  const tCommon = useTranslations('Views.ClientArea.Common');

  const { pagination, sorting, filterValues, setPagination, setSorting, setFilter, isPending } =
    useClientTableUrlState({
      initialPageSize: INCIDENTS_PER_PAGE,
      filterParams: ['status'],
    });

  const filters: Filter[] = [
    {
      key: 'status',
      type: 'select',
      label: tCommon('filterLabel'),
      options: [
        { value: '', label: tCommon('filterAll') },
        ...statusOptions.map((value) => ({
          value,
          label: tCommunities(`IncidentStatus.${value}`),
        })),
      ],
    },
  ];

  const columns = useMemo<ColumnDef<CommunityIncident>[]>(
    () => [
      {
        id: 'code',
        accessorKey: 'code',
        header: () => t('codeColumn'),
        cell: ({ row }) => (
          <div>
            <strong>{row.original.code}</strong>
            <br />
            <span className="community-table__muted">{row.original.title}</span>
          </div>
        ),
      },
      {
        id: 'typeName',
        accessorKey: 'typeName',
        header: () => t('typeColumn'),
        enableSorting: false,
      },
      {
        id: 'priority',
        accessorKey: 'priority',
        header: () => t('priorityColumn'),
        enableSorting: false,
        cell: ({ getValue }) => (
          <Badge
            variant={INCIDENT_PRIORITY_VARIANTS[getValue<CommunityIncident['priority']>()]}
            text={tCommunities(`IncidentPriority.${getValue<CommunityIncident['priority']>()}`)}
          />
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => t('statusColumn'),
        enableSorting: false,
        cell: ({ row }) => (
          <>
            <Badge
              variant={INCIDENT_STATUS_VARIANTS[row.original.status]}
              text={tCommunities(`IncidentStatus.${row.original.status}`)}
            />
            {row.original.isOverdue && (
              <>
                <br />
                <Badge variant="danger" text={t('overdue')} />
              </>
            )}
          </>
        ),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: () => t('createdAtColumn'),
        cell: ({ getValue }) =>
          formatBillingDate(getValue<string>(), locale, tCommon('notAvailable')),
        // Ordenable: `createdAt` está en la whitelist `SORTABLE_FIELDS` del backend.
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            href={resolveDetailHref('/private-area/incidents/[id]', row.original.id)}
            className="client-list__link"
          >
            {tCommon('viewDetail')}
          </Link>
        ),
      },
    ],
    [t, tCommunities, tCommon, locale],
  );

  return (
    <Table
      data={data.items}
      columns={columns}
      getRowId={(incident) => incident.id}
      manualPagination
      pagination={pagination}
      rowCount={data.pagination.totalItems}
      onPaginationChange={setPagination}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      searchable={false}
      manualFiltering
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilter(key, typeof value === 'string' ? value : '')}
      onClearAll={() => setFilter('status', '')}
      isLoading={isPending}
      emptyMessage={t('allEmptyTitle')}
    />
  );
}
