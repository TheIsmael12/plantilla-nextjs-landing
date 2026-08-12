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
  /** Añade las columnas de vivienda y de quién la abrió, que solo tienen sentido dentro de una comunidad. */
  showCommunityColumns?: boolean;
}

/**
 * Tabla de incidencias del portal, con paginación, orden y filtro por estado
 * delegados al servidor y sincronizados con la URL vía `useClientTableUrlState`.
 * `data` es siempre la página actual, ya filtrada/ordenada por el backend.
 *
 * La usan las dos pantallas de incidencias —la lista general y la de una comunidad—, y por eso las columnas
 * de **vivienda** y **quién la abrió** son opcionales: dentro de una comunidad son la mitad de la información
 * («el 3.º D, y lo avisó su inquilino»), mientras que en la lista general, donde una incidencia puede no
 * pertenecer a ninguna comunidad, serían dos columnas casi siempre vacías.
 * @param {IncidentsTableProps} props - Página actual de incidencias, locale, opciones del filtro y si se muestran las columnas de comunidad
 * @returns {JSX.Element} La tabla de incidencias renderizada
 */
export default function IncidentsTable({
  data,
  locale,
  statusOptions,
  showCommunityColumns = false,
}: IncidentsTableProps) {
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
      /*
       * Las dos de comunidad van juntas y detrás del tipo, no al final.
       *
       * Leyendo una fila, «avería · 3.º D · lo avisó el inquilino» es una frase; con la vivienda al final,
       * después del estado y la fecha, hay que volver atrás para saber de qué casa se hablaba.
       *
       * `enableSorting: false` en las dos: el backend solo ordena por los campos de su lista blanca, y
       * ofrecer una flecha que no ordena nada es peor que no ofrecerla.
       */
      ...(showCommunityColumns
        ? ([
            {
              id: 'communityUnitCode',
              accessorKey: 'communityUnitCode',
              header: () => t('unitColumn'),
              enableSorting: false,
              cell: ({ row }) =>
                row.original.communityUnitCode ?? (
                  <span className="community-table__muted">{t('noUnit')}</span>
                ),
            },
            {
              id: 'reportedByResidentName',
              accessorKey: 'reportedByResidentName',
              header: () => t('reportedByColumn'),
              enableSorting: false,
              cell: ({ row }) =>
                row.original.reportedByResidentName ?? (
                  <span className="community-table__muted">{t('unknownResident')}</span>
                ),
            },
          ] satisfies ColumnDef<CommunityIncident>[])
        : []),
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
        /*
         * Las dos chapas en una fila que envuelve, no separadas por un `<br>`.
         *
         * Con el salto forzado, cada incidencia fuera de plazo hacía su fila el doble de alta que las demás y
         * la tabla quedaba con los renglones a distinta altura. Envolviendo solo cuando no caben, en una
         * pantalla normal van juntas y en una estrecha se apilan sin que nadie lo tenga que decidir.
         */
        cell: ({ row }) => (
          <span className="incidents__status-badges">
            <Badge
              variant={INCIDENT_STATUS_VARIANTS[row.original.status]}
              text={tCommunities(`IncidentStatus.${row.original.status}`)}
            />
            {row.original.isOverdue && <Badge variant="danger" text={t('overdue')} />}
          </span>
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
    [t, tCommunities, tCommon, locale, showCommunityColumns],
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
