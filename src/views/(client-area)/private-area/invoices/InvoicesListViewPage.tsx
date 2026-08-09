import { getTranslations } from 'next-intl/server';

import { getClientInvoices } from '@/actions/client-portal/invoices-actions';

import ClientListEmptyState from '@/components/ui/client-area/ClientListEmptyState';
import InvoicesList from '@/components/ui/client-area/InvoicesList';

import type { InvoiceStatus } from '@/types/client-portal/invoices';

import '@/styles/04-components/client-area/client-list.scss';

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
export default async function InvoicesListViewPage({
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

  const response = await getClientInvoices({ page, limit, status, search });

  return (
    <main className="client-area-page">
      <h1 className="client-area-page__title">{t('title')}</h1>

      {response.data && (response.data.pagination.totalItems > 0 || status || search) ? (
        <InvoicesList data={response.data} locale={locale} statusOptions={STATUS_OPTIONS} />
      ) : (
        <ClientListEmptyState
          resource="invoices"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      )}
    </main>
  );
}
