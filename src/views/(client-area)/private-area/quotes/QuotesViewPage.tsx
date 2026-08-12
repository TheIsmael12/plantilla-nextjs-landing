import { getTranslations } from 'next-intl/server';

import { getClientQuotes } from '@/actions/client-portal/quotes-actions';

import QuotesList from '@/views/(client-area)/private-area/quotes/components/QuotesList';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

import type { QuoteStatus } from '@/types/client-portal/quotes';

const QUOTES_PER_PAGE = 10;

// `DRAFT` queda fuera a propósito: el backend nunca expone presupuestos en
// borrador al portal, así que ofrecerlo como filtro daría siempre vacío.
const STATUS_OPTIONS: QuoteStatus[] = ['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

interface QuotesViewPageProps {
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de `/private-area/quotes`: listado paginado de presupuestos con filtro por estado navegable por URL.
 * Aceptar o rechazar vive en el detalle, así que el listado se mantiene de solo lectura.
 *
 * La vista solo compone: resuelve los filtros, pide los datos y entrega el bloque a `QuotesList`.
 * @param {QuotesViewPageProps} props - Locale activo y query params de filtro/paginación
 * @returns {Promise<JSX.Element>} El listado de presupuestos renderizado
 */
export default async function QuotesViewPage({ locale, searchParams }: QuotesViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Quotes');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const status = STATUS_OPTIONS.includes(searchParams.status as QuoteStatus)
    ? (searchParams.status as QuoteStatus)
    : undefined;

  const response = await getClientQuotes({ page, limit: QUOTES_PER_PAGE, status });

  return (
    <>
      <ViewHeader title={t('title')} description={t('description')} />

      <QuotesList
        quotes={response.data?.items ?? []}
        pagination={response.data?.pagination}
        page={page}
        status={status}
        statusOptions={STATUS_OPTIONS}
        locale={locale}
      />
    </>
  );
}
