import { getTranslations } from 'next-intl/server';

import { getClientServices } from '@/actions/client-portal/services-actions';

import ClientListEmptyState from '@/views/(client-area)/private-area/components/ClientListEmptyState';
import ServicesList from '@/views/(client-area)/private-area/services/components/ServicesList';

import type { ClientServiceStatus } from '@/types/client-portal/services';

import '@/styles/04-components/client-area/service-card.scss';
import '@/styles/04-components/client-area/client-list.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

const SERVICES_PER_PAGE = 10;

const STATUS_OPTIONS: ClientServiceStatus[] = [
  'ACTIVE',
  'PENDING_PAYMENT',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
];

interface ServicesListViewPageProps {
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de `/private-area/services`: listado de servicios contratados en
 * modo `List` (rejilla de tarjetas, no tabla de columnas), con paginación,
 * búsqueda y filtro por estado delegados al servidor. Server Component como
 * el resto de listados de solo lectura. Pinta su propio `<h1>` porque estas
 * páginas usan el layout público (`Navbar`/`Footer`) y no disponen del
 * `TitleComponent` que aportaba `ProfileLayout`.
 * @param {ServicesListViewPageProps} props - Locale activo y query params de filtro/paginación/búsqueda
 * @returns {Promise<JSX.Element>} El listado de servicios renderizado
 */
export default async function ServicesViewPage({
  locale,
  searchParams,
}: ServicesListViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Services');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const limit = Number(searchParams.limit) > 0 ? Number(searchParams.limit) : SERVICES_PER_PAGE;
  const status = STATUS_OPTIONS.includes(searchParams.status as ClientServiceStatus)
    ? (searchParams.status as ClientServiceStatus)
    : undefined;
  const search = searchParams.q?.trim() || undefined;

  const response = await getClientServices({ page, limit, status, search });

  return (
    <>
      {/* Título y explicación, como en el resto de listados del portal: en una pantalla que solo enseña
          tarjetas, la frase de debajo es lo que dice qué son y para qué sirve entrar en ellas. */}
      <ViewHeader title={t('title')} description={t('description')} />

      {response.data && (response.data.pagination.totalItems > 0 || status || search) ? (
        <ServicesList data={response.data} locale={locale} statusOptions={STATUS_OPTIONS} />
      ) : (
        <ClientListEmptyState
          resource="services"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      )}
    </>
  );
}
