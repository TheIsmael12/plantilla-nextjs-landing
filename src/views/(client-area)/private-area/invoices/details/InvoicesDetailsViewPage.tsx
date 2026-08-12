import { getTranslations } from 'next-intl/server';
import { ArrowLeftIcon, ReceiptIcon } from 'lucide-react';

import {
  downloadClientInvoicePdf,
  getClientInvoiceDetail,
} from '@/actions/client-portal/invoices-actions';
import {
  formatBillingAmount,
  formatBillingDate,
  INVOICE_PAYMENT_METHOD_VARIANTS,
} from '@/utils/billingFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import BreadcrumbLabel from '@/components/ui/navigations/BreadcrumbLabel';
import DocumentDownloadButton from '@/views/(client-area)/private-area/components/DocumentDownloadButton';
import SettingsSection from '@/components/ui/sections/SettingsSection';
import { Link, resolveHref } from '@/i18n/navigation';

import type { BadgeVariant } from '@/types/ui/buttons/badge';
import type { InvoiceStatus } from '@/types/client-portal/invoices';

import '@/styles/04-components/client-area/client-detail.scss';
import '@/styles/04-components/client-area/client-list.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

const STATUS_VARIANTS: Record<InvoiceStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  ISSUED: 'info',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
};

interface InvoiceDetailViewPageProps {
  id: string;
  locale: string;
}

/**
 * Vista de `/private-area/invoices/[id]`: cabecera, líneas, totales, cobros
 * registrados y abonos asociados. `pendingAmount` llega ya calculado por el
 * backend, así que no se recalcula aquí para no arriesgar discrepancias de
 * redondeo con el documento fiscal.
 * @param {InvoiceDetailViewPageProps} props - Id de la factura y locale activo
 * @returns {Promise<JSX.Element>} El detalle de la factura renderizado
 */
export default async function InvoicesDetailsViewPage({ id, locale }: InvoiceDetailViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Invoices');
  const tDetail = await getTranslations('Views.ClientArea.Invoices.Detail');
  const tLines = await getTranslations('Views.ClientArea.Quotes.Lines');
  const tTotals = await getTranslations('Views.ClientArea.Quotes.Totals');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  const response = await getClientInvoiceDetail(id);
  const invoice = response.data;

  if (!invoice) {
    return (
      <>
        <p className="client-detail__empty">{tDetail('notFound')}</p>
      </>
    );
  }

  /*
   * La descarga se le pasa al botón ya atada a esta factura.
   *
   * `bind` y no una función nueva: el botón es un componente de cliente, y lo único que puede recibir del
   * servidor como función es una server action —una acción atada sigue siéndolo, una lambda cualquiera no—.
   * Además así el id no viaja al navegador como prop.
   */
  const downloadPdf = downloadClientInvoicePdf.bind(null, invoice.id);

  const money = (value: number | undefined) =>
    formatBillingAmount(value, invoice.currency, locale, tCommon('notAvailable'));

  const hasLineDiscounts = invoice.lines.some((line) => line.discountPercentage > 0);

  return (
    <>
      <BreadcrumbLabel label={invoice.fullNumber ?? undefined} />
      <ViewHeader title={tDetail('title')} returnPath="/private-area/invoices" />

      <div className="client-detail">
        <SettingsSection title={invoice.fullNumber ?? t('noNumber')} icon={ReceiptIcon}>
          <dl className="client-detail__list">
            <div className="client-detail__row">
              <dt className="client-detail__term">{tCommon('statusLabel')}</dt>
              <dd className="client-detail__value">
                <Badge
                  variant={STATUS_VARIANTS[invoice.status]}
                  text={t(`Status.${invoice.status}`)}
                />
              </dd>
            </div>

            <div className="client-detail__row">
              <dt className="client-detail__term">{t('issueDate')}</dt>
              <dd className="client-detail__value">
                {formatBillingDate(invoice.issueDate, locale, tCommon('notAvailable'))}
              </dd>
            </div>

            <div className="client-detail__row">
              <dt className="client-detail__term">{t('dueDate')}</dt>
              <dd className="client-detail__value">
                {formatBillingDate(invoice.dueDate, locale, tCommon('notAvailable'))}
              </dd>
            </div>

            <div className="client-detail__row">
              <dt className="client-detail__term">{t('pendingAmount')}</dt>
              <dd className="client-detail__value">{money(invoice.pendingAmount)}</dd>
            </div>
          </dl>

          {/*
            Un botón, y siempre que la factura esté emitida.

            Antes era un enlace de texto —fácil de no ver— y solo aparecía si la factura ya tenía el PDF
            guardado, que en la práctica dejaba sin descarga a cualquier factura emitida antes de que
            existiera esa generación. Ahora la API lo genera en la primera descarga, así que el único caso
            sin documento es el borrador, y un borrador no se le enseña al cliente.
          */}
          <div className="client-detail__actions">
            <DocumentDownloadButton
              download={downloadPdf}
              filename={invoice.fullNumber ?? invoice.id}
              variant="primary"
            />
          </div>
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
                {invoice.lines.map((line) => (
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
              <span>{money(invoice.totals.subtotal)}</span>
            </div>

            {invoice.totals.documentDiscountAmount > 0 && (
              <div className="client-detail__totals-row">
                <span>
                  {tTotals('documentDiscount')} ({invoice.documentDiscountPercentage}%)
                </span>
                <span>-{money(invoice.totals.documentDiscountAmount)}</span>
              </div>
            )}

            {invoice.totals.documentDiscountAmount > 0 && (
              <div className="client-detail__totals-row">
                <span>{tTotals('subtotalAfterDiscount')}</span>
                <span>{money(invoice.totals.subtotalAfterDocumentDiscount)}</span>
              </div>
            )}

            {invoice.totals.taxAmount > 0 && (
              <div className="client-detail__totals-row">
                <span>{tTotals('tax')}</span>
                <span>{money(invoice.totals.taxAmount)}</span>
              </div>
            )}

            {invoice.totals.withholdingAmount > 0 && (
              <div className="client-detail__totals-row">
                <span>{tTotals('withholding')}</span>
                <span>-{money(invoice.totals.withholdingAmount)}</span>
              </div>
            )}

            <div className="client-detail__totals-row client-detail__totals-row--emphasis">
              <span>{tTotals('total')}</span>
              <span>{money(invoice.totals.total)}</span>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title={tDetail('paymentsTitle')}>
          {invoice.payments.length > 0 ? (
            <div className="client-detail__table-wrapper">
              <table className="client-detail__table">
                <thead>
                  <tr>
                    <th scope="col">{tDetail('paymentDate')}</th>
                    <th scope="col">{tDetail('method')}</th>
                    <th scope="col">{tDetail('reference')}</th>
                    <th scope="col">{tDetail('amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        {formatBillingDate(payment.paymentDate, locale, tCommon('notAvailable'))}
                      </td>
                      <td>
                        <Badge
                          variant={INVOICE_PAYMENT_METHOD_VARIANTS[payment.method]}
                          text={t(`PaymentMethod.${payment.method}`)}
                        />
                      </td>
                      <td>{payment.reference ?? tCommon('notAvailable')}</td>
                      <td>{money(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="client-detail__empty">{tDetail('paymentsEmpty')}</p>
          )}
        </SettingsSection>

        <SettingsSection title={tDetail('creditNotesTitle')}>
          {invoice.creditNotes && invoice.creditNotes.length > 0 ? (
            <dl className="client-detail__list">
              {invoice.creditNotes.map((creditNote) => (
                <div key={creditNote.id} className="client-detail__row">
                  <dt className="client-detail__term">{creditNote.fullNumber ?? t('noNumber')}</dt>
                  <dd className="client-detail__value">
                    {formatBillingDate(creditNote.issueDate, locale, tCommon('notAvailable'))} ·{' '}
                    {money(creditNote.total)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="client-detail__empty">{tDetail('creditNotesEmpty')}</p>
          )}
        </SettingsSection>
      </div>
    </>
  );
}
