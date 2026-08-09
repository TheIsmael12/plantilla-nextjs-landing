'use client';

import { useTranslations } from 'next-intl';
import { BriefcaseIcon, CalendarIcon, MapPinIcon, RepeatIcon } from 'lucide-react';

import { useClientTableUrlState } from '@/hooks/useClientTableUrlState';
import { formatBillingAmount, formatBillingDate } from '@/utils/billingFormatUtils';
import { formatServiceAddress } from '@/utils/addressFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import List from '@/components/ui/lists/List';
import { Link, resolveDetailHref } from '@/i18n/navigation';

import type { BadgeVariant } from '@/types/ui/buttons/badge';
import type { ClientServiceListItem, ClientServiceStatus } from '@/types/client-portal/services';
import type { PaginatedResult } from '@/types/responses';
import type { Filter } from '@/types/ui/tables/table';

import '@/styles/04-components/client-area/service-card.scss';

const SERVICES_PER_PAGE = 10;

const STATUS_VARIANTS: Record<ClientServiceStatus, BadgeVariant> = {
  PENDING_PAYMENT: 'warning',
  ACTIVE: 'success',
  PAUSED: 'info',
  CANCELLED: 'danger',
  COMPLETED: 'neutral',
};

interface ServicesListProps {
  data: PaginatedResult<ClientServiceListItem>;
  locale: string;
  statusOptions: ClientServiceStatus[];
}

/**
 * Listado de servicios contratados del portal en modo `List` (tarjeta libre,
 * no tabla de columnas): paginación, búsqueda y filtro por estado delegados
 * al servidor y sincronizados con la URL vía `useClientTableUrlState`.
 * `data` es siempre la página actual, ya filtrada/ordenada por el backend.
 * @param {ServicesListProps} props - Página actual de servicios, locale y opciones del filtro de estado
 * @returns {JSX.Element} El listado de servicios renderizado
 */
export default function ServicesList({ data, locale, statusOptions }: ServicesListProps) {
  const t = useTranslations('Views.ClientArea.Services');
  const tCommon = useTranslations('Views.ClientArea.Common');

  const { pagination, search, filterValues, setPagination, setSearch, setFilter, isPending } =
    useClientTableUrlState({
      initialPageSize: SERVICES_PER_PAGE,
      filterParams: ['status'],
    });

  const filters: Filter[] = [
    {
      key: 'status',
      type: 'select',
      label: tCommon('filterLabel'),
      options: [
        { value: '', label: tCommon('filterAll') },
        ...statusOptions.map((value) => ({ value, label: t(`Status.${value}`) })),
      ],
    },
  ];

  return (
    <List
      items={data.items}
      getItemId={(service) => service.id}
      manualPagination
      pagination={pagination}
      rowCount={data.pagination.totalItems}
      onPaginationChange={setPagination}
      searchable
      searchPlaceholder={t('searchPlaceholder')}
      manualFiltering
      globalFilter={search}
      onSearchChange={setSearch}
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilter(key, typeof value === 'string' ? value : '')}
      onClearAll={() => setFilter('status', '')}
      isLoading={isPending}
      emptyMessage={t('emptyDescription')}
      ariaLabel={t('title')}
      listClassName="service-card__grid"
      renderItem={(service) => (
        <Link
          href={resolveDetailHref('/private-area/services/[id]', service.id)}
          className="service-card"
        >
          <div className="service-card__header">
            <span className="service-card__icon">
              <BriefcaseIcon aria-hidden="true" />
            </span>
            <Badge
              variant={STATUS_VARIANTS[service.status]}
              text={t(`Status.${service.status}`)}
              className="service-card__status"
            />
          </div>

          <div className="service-card__body">
            <span className="service-card__code">{service.code}</span>
            <h2 className="service-card__title">{service.serviceName}</h2>
          </div>

          <dl className="service-card__meta">
            <div className="service-card__meta-item">
              <CalendarIcon aria-hidden="true" />
              <span>{formatBillingDate(service.startDate, locale, tCommon('notAvailable'))}</span>
            </div>
            <div className="service-card__meta-item">
              <RepeatIcon aria-hidden="true" />
              <span>{t(`BillingFrequency.${service.billingFrequency}`)}</span>
            </div>
            {formatServiceAddress(service.address) && (
              <div className="service-card__meta-item">
                <MapPinIcon aria-hidden="true" />
                <span>{formatServiceAddress(service.address)}</span>
              </div>
            )}
          </dl>

          {service.canReadPrices && service.basePrice !== undefined && (
            <div className="service-card__price">
              {formatBillingAmount(service.basePrice, 'EUR', locale, tCommon('notAvailable'))}
            </div>
          )}
        </Link>
      )}
    />
  );
}
