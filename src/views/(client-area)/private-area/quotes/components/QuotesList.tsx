import { getTranslations } from 'next-intl/server';

import { formatBillingDate } from '@/utils/billingFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import ClientListEmptyState from '@/views/(client-area)/private-area/components/ClientListEmptyState';
import ClientListPagination from '@/views/(client-area)/private-area/components/ClientListPagination';
import StatusFilter from '@/views/(client-area)/private-area/components/StatusFilter';
import { Link, resolveDetailHref } from '@/i18n/navigation';

import type { BadgeVariant } from '@/types/ui/buttons/badge';
import type { QuoteListItem, QuoteStatus } from '@/types/client-portal/quotes';
import type { PaginationMeta } from '@/types/responses';

import '@/styles/04-components/client-area/client-list.scss';

const STATUS_VARIANTS: Record<QuoteStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  SENT: 'info',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  EXPIRED: 'warning',
};

interface QuotesListProps {
  quotes: QuoteListItem[];
  pagination: PaginationMeta | undefined;
  /** Página pedida en la URL; se usa si la respuesta no trae paginación. */
  page: number;
  /** Estado filtrado, o `undefined` para todos. */
  status: QuoteStatus | undefined;
  statusOptions: QuoteStatus[];
  locale: string;
}

/**
 * El listado de presupuestos: filtro por estado, filas y paginación.
 *
 * Está en un componente y no suelto en el `ViewPage` porque es el bloque de la pantalla, y el contrato del
 * proyecto es que la vista solo compone —título, estados y bloques— mientras el marcado vive en un componente
 * de su `components/`. Es además lo que ya hacían facturas y servicios con sus `InvoicesList` y `ServicesList`;
 * presupuestos era el que se había quedado con la lista escrita dentro de la vista.
 * @param {QuotesListProps} props - Página de presupuestos, paginación, filtro activo y locale
 * @returns {Promise<JSX.Element>} El listado renderizado
 */
export default async function QuotesList({
  quotes,
  pagination,
  page,
  status,
  statusOptions,
  locale,
}: QuotesListProps) {
  const t = await getTranslations('Views.ClientArea.Quotes');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  return (
    <div className="client-list">
      <StatusFilter
        label={tCommon('filterLabel')}
        allLabel={tCommon('filterAll')}
        activeStatus={status}
        options={statusOptions.map((value) => ({ value, label: t(`Status.${value}`) }))}
      />

      {quotes.length > 0 ? (
        <>
          <div className="client-list__rows">
            {quotes.map((quote) => (
              <Link
                key={quote.id}
                href={resolveDetailHref('/private-area/quotes/[id]', quote.id)}
                className="client-list__row"
              >
                <div className="client-list__row-main">
                  <span className="client-list__row-code">{quote.quoteCode}</span>
                  <span className="client-list__row-subtitle">
                    {t('validUntil')}:{' '}
                    {formatBillingDate(quote.validUntil, locale, tCommon('notAvailable'))}
                  </span>
                </div>

                <div className="client-list__row-meta">
                  <div className="client-list__row-field">
                    <span className="client-list__row-label">{t('issueDate')}</span>
                    <span className="client-list__row-value">
                      {formatBillingDate(quote.issueDate, locale, tCommon('notAvailable'))}
                    </span>
                  </div>

                  <Badge
                    variant={STATUS_VARIANTS[quote.status]}
                    text={t(`Status.${quote.status}`)}
                  />
                </div>
              </Link>
            ))}
          </div>

          <ClientListPagination
            basePath="/private-area/quotes"
            currentPage={pagination?.page ?? page}
            totalPages={pagination?.totalPages ?? 1}
            searchParams={{ status }}
          />
        </>
      ) : (
        <ClientListEmptyState
          resource="quotes"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      )}
    </div>
  );
}
