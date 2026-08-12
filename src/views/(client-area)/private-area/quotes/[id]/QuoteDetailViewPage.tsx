import { getTranslations } from 'next-intl/server';
import { ArrowLeftIcon, FileTextIcon } from 'lucide-react';

import {
  downloadClientQuotePdf,
  getClientQuoteDetail,
} from '@/actions/client-portal/quotes-actions';
import { formatBillingAmount, formatBillingDate } from '@/utils/billingFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import DocumentDownloadButton from '@/components/ui/client-area/DocumentDownloadButton';
import QuoteDecisionActions from '@/components/ui/client-area/QuoteDecisionActions';
import SettingsSection from '@/components/ui/sections/SettingsSection';
import { Link, resolveHref } from '@/i18n/navigation';

import type { BadgeVariant } from '@/types/ui/buttons/badge';
import type { QuoteStatus } from '@/types/client-portal/quotes';

import '@/styles/04-components/client-area/client-detail.scss';
import '@/styles/04-components/client-area/client-list.scss';

const STATUS_VARIANTS: Record<QuoteStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  SENT: 'info',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  EXPIRED: 'warning',
};

interface QuoteDetailViewPageProps {
  id: string;
  locale: string;
}

/**
 * Vista de `/private-area/quotes/[id]`: cabecera, líneas, totales y
 * condiciones del presupuesto. Los botones de decisión se delegan en
 * {@link QuoteDecisionActions} (Client Component) y solo se montan mientras
 * el presupuesto sigue en `SENT`, que es el único estado en el que el backend
 * acepta aceptarlo o rechazarlo.
 * @param {QuoteDetailViewPageProps} props - Id del presupuesto y locale activo
 * @returns {Promise<JSX.Element>} El detalle del presupuesto renderizado
 */
export default async function QuoteDetailViewPage({ id, locale }: QuoteDetailViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Quotes');
  const tDetail = await getTranslations('Views.ClientArea.Quotes.Detail');
  const tLines = await getTranslations('Views.ClientArea.Quotes.Lines');
  const tTotals = await getTranslations('Views.ClientArea.Quotes.Totals');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  const response = await getClientQuoteDetail(id);
  const quote = response.data;

  const backLink = (
    <Link href={resolveHref('/private-area/quotes')} className="client-area-page__back">
      <ArrowLeftIcon size={16} aria-hidden="true" />
      {tCommon('backToList')}
    </Link>
  );

  if (!quote) {
    return (
      <main className="client-area-page">
        {backLink}
        <p className="client-detail__empty">{tDetail('notFound')}</p>
      </main>
    );
  }

  // Atada a este presupuesto: el botón es de cliente y solo puede recibir del servidor una server action.
  const downloadPdf = downloadClientQuotePdf.bind(null, quote.id);

  const money = (value: number | undefined) =>
    formatBillingAmount(value, quote.currency, locale, tCommon('notAvailable'));

  const terms = [
    { key: 'paymentTerms', value: quote.paymentTermsText },
    { key: 'billingTerms', value: quote.billingTermsText },
    { key: 'latePaymentTerms', value: quote.latePaymentTermsText },
    { key: 'terminationTerms', value: quote.terminationTermsText },
    { key: 'jurisdictionTerms', value: quote.jurisdictionTermsText },
  ].filter((term) => Boolean(term.value));

  const hasLineDiscounts = quote.lines.some((line) => line.discountPercentage > 0);

  return (
    <main className="client-area-page">
      {backLink}
      <h1 className="client-area-page__title">{tDetail('title')}</h1>

      <div className="client-detail">
        <SettingsSection title={quote.quoteCode} icon={FileTextIcon}>
          <dl className="client-detail__list">
            <div className="client-detail__row">
              <dt className="client-detail__term">{tCommon('statusLabel')}</dt>
              <dd className="client-detail__value">
                <Badge variant={STATUS_VARIANTS[quote.status]} text={t(`Status.${quote.status}`)} />
              </dd>
            </div>

            <div className="client-detail__row">
              <dt className="client-detail__term">{t('issueDate')}</dt>
              <dd className="client-detail__value">
                {formatBillingDate(quote.issueDate, locale, tCommon('notAvailable'))}
              </dd>
            </div>

            <div className="client-detail__row">
              <dt className="client-detail__term">{t('validUntil')}</dt>
              <dd className="client-detail__value">
                {formatBillingDate(quote.validUntil, locale, tCommon('notAvailable'))}
              </dd>
            </div>

            {quote.contractMonths !== undefined && (
              <div className="client-detail__row">
                <dt className="client-detail__term">{tDetail('contractMonths')}</dt>
                <dd className="client-detail__value">
                  {tDetail('months', { count: quote.contractMonths })}
                </dd>
              </div>
            )}

            {quote.notes && (
              <div className="client-detail__row">
                <dt className="client-detail__term">{t('notes')}</dt>
                <dd className="client-detail__value">{quote.notes}</dd>
              </div>
            )}
          </dl>

          {/*
            Botón en vez de enlace de texto, y sin depender de que el PDF esté ya guardado: la API lo genera
            en la primera descarga. Va en `outline` porque en esta pantalla la acción principal es aceptar o
            rechazar el presupuesto, no llevárselo.
          */}
          <div className="client-detail__actions">
            <DocumentDownloadButton download={downloadPdf} filename={quote.quoteCode} />
          </div>

          {quote.status === 'SENT' && <QuoteDecisionActions quoteId={quote.id} />}
        </SettingsSection>

        <SettingsSection title={tDetail('linesTitle')}>
          <div className="client-detail__table-wrapper">
            <table className="client-detail__table">
              <thead>
                <tr>
                  <th scope="col">{tLines('description')}</th>
                  <th scope="col">{tLines('quantity')}</th>
                  <th scope="col">{tLines('unitPrice')}</th>
                  {hasLineDiscounts && <th scope="col">{tLines('discount')}</th>}
                  <th scope="col">{tLines('taxRate')}</th>
                  <th scope="col">{tLines('total')}</th>
                </tr>
              </thead>
              <tbody>
                {quote.lines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.description}</td>
                    <td>{line.quantity}</td>
                    <td>{money(line.unitPrice)}</td>
                    {hasLineDiscounts && <td>{line.discountPercentage}%</td>}
                    <td>{line.taxRate}%</td>
                    <td>{money(line.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsSection>

        <SettingsSection title={tDetail('totalsTitle')}>
          <div className="client-detail__totals">
            <div className="client-detail__totals-row">
              <span>{tTotals('subtotal')}</span>
              <span>{money(quote.totals.subtotal)}</span>
            </div>

            {quote.totals.documentDiscountAmount > 0 && (
              <div className="client-detail__totals-row">
                <span>
                  {tTotals('documentDiscount')} ({quote.documentDiscountPercentage}%)
                </span>
                <span>-{money(quote.totals.documentDiscountAmount)}</span>
              </div>
            )}

            {quote.totals.documentDiscountAmount > 0 && (
              <div className="client-detail__totals-row">
                <span>{tTotals('subtotalAfterDiscount')}</span>
                <span>{money(quote.totals.subtotalAfterDocumentDiscount)}</span>
              </div>
            )}

            {quote.totals.taxAmount > 0 && (
              <div className="client-detail__totals-row">
                <span>{tTotals('tax')}</span>
                <span>{money(quote.totals.taxAmount)}</span>
              </div>
            )}

            {quote.totals.withholdingAmount > 0 && (
              <div className="client-detail__totals-row">
                <span>{tTotals('withholding')}</span>
                <span>-{money(quote.totals.withholdingAmount)}</span>
              </div>
            )}

            <div className="client-detail__totals-row client-detail__totals-row--emphasis">
              <span>{tTotals('total')}</span>
              <span>{money(quote.totals.total)}</span>
            </div>
          </div>
        </SettingsSection>

        {terms.length > 0 && (
          <SettingsSection title={tDetail('termsTitle')}>
            <div className="client-detail__terms">
              {terms.map((term) => (
                <div key={term.key} className="client-detail__terms-block">
                  <p className="client-detail__terms-title">{tDetail(term.key)}</p>
                  <p className="client-detail__terms-text">{term.value}</p>
                </div>
              ))}
            </div>
          </SettingsSection>
        )}
      </div>
    </main>
  );
}
