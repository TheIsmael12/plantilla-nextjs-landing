import { getTranslations } from 'next-intl/server';

import { getClientQuotes } from '@/actions/client-portal/quotes-actions';
import { formatBillingDate } from '@/utils/billingFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import ClientListEmptyState from '@/components/ui/client-area/ClientListEmptyState';
import ClientListPagination from '@/components/ui/client-area/ClientListPagination';
import StatusFilter from '@/components/ui/client-area/StatusFilter';
import { Link, resolveDetailHref } from '@/i18n/navigation';

import type { BadgeVariant } from '@/types/ui/buttons/badge';
import type { QuoteStatus } from '@/types/client-portal/quotes';

import '@/styles/04-components/client-area/client-list.scss';

const QUOTES_PER_PAGE = 10;

// `DRAFT` queda fuera a propósito: el backend nunca expone presupuestos en
// borrador al portal, así que ofrecerlo como filtro daría siempre vacío.
const STATUS_OPTIONS: QuoteStatus[] = ['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

const STATUS_VARIANTS: Record<QuoteStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  SENT: 'info',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  EXPIRED: 'warning',
};

interface QuotesListViewPageProps {
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de `/private-area/quotes`: listado paginado de presupuestos con
 * filtro por estado navegable por URL. Aceptar/rechazar vive en el detalle,
 * así que el listado se mantiene como Server Component de solo lectura.
 * @param {QuotesListViewPageProps} props - Locale activo y query params de filtro/paginación
 * @returns {Promise<JSX.Element>} El listado de presupuestos renderizado
 */
export default async function QuotesListViewPage({
  locale,
  searchParams,
}: QuotesListViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Quotes');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const status = STATUS_OPTIONS.includes(searchParams.status as QuoteStatus)
    ? (searchParams.status as QuoteStatus)
    : undefined;

  const response = await getClientQuotes({ page, limit: QUOTES_PER_PAGE, status });

  const quotes = response.data?.items ?? [];
  const pagination = response.data?.pagination;

  return (
    <main className="client-area-page">
      <h1 className="client-area-page__title">{t('title')}</h1>

      <div className="client-list">
        <StatusFilter
          label={tCommon('filterLabel')}
          allLabel={tCommon('filterAll')}
          activeStatus={status}
          options={STATUS_OPTIONS.map((value) => ({ value, label: t(`Status.${value}`) }))}
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
    </main>
  );
}
