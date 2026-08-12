'use client';

import { useTranslations } from 'next-intl';

import { useClientTableUrlState } from '@/hooks/useClientTableUrlState';
import { formatBillingDate } from '@/utils/billingFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import List from '@/components/ui/lists/List';
import { Link, resolveDetailHref } from '@/i18n/navigation';

import '@/styles/04-components/client-area/client-list.scss';

import type { BadgeVariant } from '@/types/ui/buttons/badge';
import type { InvoiceListItem, InvoiceStatus } from '@/types/client-portal/invoices';
import type { PaginatedResult } from '@/types/responses';
import type { Filter } from '@/types/ui/tables/table';

const INVOICES_PER_PAGE = 10;

const STATUS_VARIANTS: Record<InvoiceStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  ISSUED: 'info',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
};

interface InvoicesListProps {
  data: PaginatedResult<InvoiceListItem>;
  locale: string;
  statusOptions: InvoiceStatus[];
}

/**
 * Listado de facturas del portal en modo `List` (tarjeta/fila libre, no
 * tabla de columnas): paginación, búsqueda y filtro por estado delegados al
 * servidor y sincronizados con la URL vía `useClientTableUrlState`. `data`
 * es siempre la página actual, ya filtrada/ordenada por el backend.
 * @param {InvoicesListProps} props - Página actual de facturas, locale y opciones del filtro de estado
 * @returns {JSX.Element} El listado de facturas renderizado
 */
export default function InvoicesList({ data, locale, statusOptions }: InvoicesListProps) {
  const t = useTranslations('Views.ClientArea.Invoices');
  const tCommon = useTranslations('Views.ClientArea.Common');

  const { pagination, search, filterValues, setPagination, setSearch, setFilter, isPending } =
    useClientTableUrlState({
      initialPageSize: INVOICES_PER_PAGE,
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
      getItemId={(invoice) => invoice.id}
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
      renderItem={(invoice) => (
        <Link
          href={resolveDetailHref('/private-area/invoices/[id]', invoice.id)}
          className="client-list__row"
        >
          <div className="client-list__row-main">
            <span className="client-list__row-code">{invoice.fullNumber ?? t('noNumber')}</span>
            <span className="client-list__row-subtitle">
              {t('issueDate')}: {formatBillingDate(invoice.issueDate, locale, tCommon('notAvailable'))}
            </span>
          </div>

          <div className="client-list__row-meta">
            <div className="client-list__row-field">
              <span className="client-list__row-label">{t('dueDate')}</span>
              <span className="client-list__row-value">
                {formatBillingDate(invoice.dueDate, locale, tCommon('notAvailable'))}
              </span>
            </div>

            <Badge variant={STATUS_VARIANTS[invoice.status]} text={t(`Status.${invoice.status}`)} />
          </div>
        </Link>
      )}
    />
  );
}
