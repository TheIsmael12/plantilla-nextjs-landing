import { getTranslations } from 'next-intl/server';

import { getClientInvoices } from '@/actions/client-portal/invoices-actions';

import ClientListEmptyState from '@/views/(client-area)/private-area/components/ClientListEmptyState';
import InvoiceSummary from '@/views/(client-area)/private-area/invoices/components/InvoiceSummary';
import InvoicesList from '@/views/(client-area)/private-area/invoices/components/InvoicesList';

import type { InvoiceStatus } from '@/types/client-portal/invoices';

import '@/styles/04-components/client-area/client-list.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

const INVOICES_PER_PAGE = 10;

// `DRAFT` queda fuera a propósito: el backend nunca expone facturas en
// borrador al portal, así que ofrecerlo como filtro daría siempre vacío.
const STATUS_OPTIONS: InvoiceStatus[] = [
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
];

interface InvoicesListViewPageProps {
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de `/private-area/invoices`: listado de facturas en modo `List`
 * (tarjeta/fila libre, no tabla de columnas), con paginación, búsqueda y
 * filtro por estado delegados al servidor. El listado no muestra importes
 * porque el DTO ligero del backend no incluye `totals` — el total y el
 * pendiente solo llegan en el detalle.
 * @param {InvoicesListViewPageProps} props - Locale activo y query params de filtro/paginación/búsqueda
 * @returns {Promise<JSX.Element>} El listado de facturas renderizado
 */
export default async function InvoicesViewPage({
  locale,
  searchParams,
}: InvoicesListViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Invoices');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const limit = Number(searchParams.limit) > 0 ? Number(searchParams.limit) : INVOICES_PER_PAGE;
  const status = STATUS_OPTIONS.includes(searchParams.status as InvoiceStatus)
    ? (searchParams.status as InvoiceStatus)
    : undefined;
  const search = searchParams.q?.trim() || undefined;
  const dateFrom = searchParams.dateFrom?.trim() || undefined;
  const dateTo = searchParams.dateTo?.trim() || undefined;

  const response = await getClientInvoices({ page, limit, status, search, dateFrom, dateTo });

  return (
    <>
      <ViewHeader title={t('title')} description={t('description')} />

      {/* Sin facturas no hay nada que resumir: cuatro ceros no dicen nada y tapan el mensaje de vacío. */}
      {response.data && response.data.pagination.totalItems > 0 && (
        <InvoiceSummary locale={locale} />
      )}

      {response.data && (response.data.pagination.totalItems > 0 || status || search) ? (
        <InvoicesList data={response.data} locale={locale} statusOptions={STATUS_OPTIONS} />
      ) : (
        <ClientListEmptyState
          resource="invoices"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      )}
    </>
  );
}
