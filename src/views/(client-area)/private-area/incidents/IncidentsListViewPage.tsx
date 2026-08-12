import { getTranslations } from 'next-intl/server';

import { PlusIcon } from 'lucide-react';

import { getCommunityIncidents } from '@/actions/client-portal/community-incidents-actions';

import { Link } from '@/i18n/navigation';

import ClientListEmptyState from '@/components/ui/client-area/ClientListEmptyState';
import IncidentCounters from '@/components/ui/client-area/IncidentCounters';
import IncidentsTable from '@/components/ui/client-area/community/IncidentsTable';

import type { IncidentStatus } from '@/types/client-portal/community';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';

const INCIDENTS_PER_PAGE = 10;

const STATUS_OPTIONS: IncidentStatus[] = [
  'NUEVA',
  'EN_CURSO',
  'ESPERANDO_TERCERO',
  'RESUELTA',
  'CERRADA',
  'RECHAZADA',
];

interface IncidentsListViewPageProps {
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Listado de todas las incidencias del cliente, con el botón para abrir una
 * nueva.
 *
 * Vive fuera de `/communities/[serviceId]` porque una incidencia del portal no
 * pertenece necesariamente a una comunidad: `clientServiceId` puede ser
 * `null`, y encajarla bajo una comunidad concreta dejaría fuera precisamente
 * las que se abren desde aquí sin asociar a ningún servicio.
 * @param {IncidentsListViewPageProps} props - Locale y query params (página y filtro por estado)
 * @returns {Promise<JSX.Element>} La pantalla de incidencias renderizada
 */
export default async function IncidentsListViewPage({
  locale,
  searchParams,
}: IncidentsListViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities.Incidents');
  const tButtons = await getTranslations('Buttons');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const limit = Number(searchParams.limit) > 0 ? Number(searchParams.limit) : INCIDENTS_PER_PAGE;
  const status = STATUS_OPTIONS.includes(searchParams.status as IncidentStatus)
    ? (searchParams.status as IncidentStatus)
    : undefined;
  const sortBy = searchParams.sortBy || undefined;
  const sortOrder = searchParams.sortOrder === 'ASC' ? 'ASC' : searchParams.sortOrder === 'DESC' ? 'DESC' : undefined;

  const response = await getCommunityIncidents({ page, limit, status, sortBy, sortOrder });

  return (
    <section className="client-list">
      <header className="client-list__header">
        <div>
          <h1 className="client-list__title">{t('allTitle')}</h1>
          <p className="client-list__description">{t('allDescription')}</p>
        </div>
        {/*
          Un enlace, no un botón que abre un modal: el alta vive en su propia página, así que esto es
          navegar. Además se puede abrir en otra pestaña, que con un `onClick` no se podía.
        */}
        <Link href="/private-area/incidents/new" className="btn btn--primary btn--md">
          <PlusIcon aria-hidden="true" />
          {tButtons('createIncident')}
        </Link>
      </header>

      {/*
        El resumen solo cuando hay algo que resumir: cuatro ceros sobre una bandeja vacía no informan de
        nada y le roban la pantalla al mensaje que sí ayuda («abre tu primera incidencia»).
      */}
      {response.data && response.data.pagination.totalItems > 0 && <IncidentCounters />}

      {response.data && (response.data.pagination.totalItems > 0 || status) ? (
        <IncidentsTable data={response.data} locale={locale} statusOptions={STATUS_OPTIONS} />
      ) : (
        <ClientListEmptyState
          resource="incidents"
          title={t('allEmptyTitle')}
          description={t('allEmptyDescription')}
        />
      )}
    </section>
  );
}
