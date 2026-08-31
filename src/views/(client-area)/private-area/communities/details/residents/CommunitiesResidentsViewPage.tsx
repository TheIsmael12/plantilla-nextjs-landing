import { getTranslations } from 'next-intl/server';

import { getCommunityConfig } from '@/actions/client-portal/communities-actions';
import { getCommunityKeyrings } from '@/actions/client-portal/community-keyrings-actions';
import { getCommunityLocks } from '@/actions/client-portal/community-locks-actions';
import {
  getCommunityInvitations,
  getCommunityResidentsPaginated,
} from '@/actions/client-portal/community-residents-actions';
import { getCommunityUnits } from '@/actions/client-portal/community-units-actions';

import CommunitiesResidentsPanel from '@/views/(client-area)/private-area/communities/details/residents/components/CommunitiesResidentsPanel';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

const RESIDENTS_PER_PAGE = 10;
const INVITATIONS_PER_PAGE = 10;

interface ResidentsViewPageProps {
  serviceId: string;
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de vecinos de una comunidad. Server Component que resuelve de una vez
 * los cuatro listados que la pantalla necesita (vecinos, invitaciones,
 * unidades y llaveros, estos dos últimos para poblar los selectores de los
 * formularios) y delega toda la interacción (incluida la paginación/orden/
 * búsqueda de cada tabla) en `CommunitiesResidentsPanel`.
 *
 * Vecinos e invitaciones son dos tablas paginables en la misma pantalla, así
 * que cada una lleva su propio namespace de query params (`page`/`limit`/
 * `sortBy`/`sortOrder`/`q` vs `invitationsPage`/`invitationsLimit`/
 * `invitationsSortBy`/`invitationsSortOrder`/`invitationsQ`, gestionados por
 * `useClientTableUrlState` dentro de `ResidentsTable`/`InvitationsTable`):
 * compartirlos haría que buscar/ordenar en una saltara la otra a una página
 * que no existe.
 * @param {ResidentsViewPageProps} props - Comunidad activa, locale y query params
 * @returns {Promise<JSX.Element>} La pantalla de vecinos renderizada
 */
export default async function CommunitiesResidentsViewPage({
  serviceId,
  locale,
  searchParams,
}: ResidentsViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities');

  const includeClosed = searchParams.closed === '1';

  const residentsPage = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const residentsLimit =
    Number(searchParams.limit) > 0 ? Number(searchParams.limit) : RESIDENTS_PER_PAGE;
  const residentsSearch = searchParams.q?.trim() || undefined;
  const residentsSortBy = searchParams.sortBy || undefined;
  const residentsSortOrder = searchParams.sortOrder === 'ASC' ? 'ASC' : searchParams.sortOrder === 'DESC' ? 'DESC' : undefined;

  const invitationsPage =
    Number(searchParams.invitationsPage) > 0 ? Number(searchParams.invitationsPage) : 1;
  const invitationsLimit =
    Number(searchParams.invitationsLimit) > 0
      ? Number(searchParams.invitationsLimit)
      : INVITATIONS_PER_PAGE;
  const invitationsSearch = searchParams.invitationsQ?.trim() || undefined;
  const invitationsSortBy = searchParams.invitationsSortBy || undefined;
  const invitationsSortOrder =
    searchParams.invitationsSortOrder === 'ASC'
      ? 'ASC'
      : searchParams.invitationsSortOrder === 'DESC'
        ? 'DESC'
        : undefined;

  const [
    residentsResponse,
    invitationsResponse,
    unitsResponse,
    keyringsResponse,
    locksResponse,
    configResponse,
  ] =
    await Promise.all([
      getCommunityResidentsPaginated(serviceId, {
        page: residentsPage,
        limit: residentsLimit,
        search: residentsSearch,
        sortBy: residentsSortBy,
        sortOrder: residentsSortOrder,
      }),
      getCommunityInvitations(serviceId, {
        page: invitationsPage,
        limit: invitationsLimit,
        search: invitationsSearch,
        includeClosed,
        sortBy: invitationsSortBy,
        sortOrder: invitationsSortOrder,
      }),
      getCommunityUnits(serviceId),
      getCommunityKeyrings(serviceId),
      getCommunityLocks(serviceId),
      getCommunityConfig(serviceId),
    ]);

  /*
   * Quién da de alta a los vecinos.
   *
   * Si la configuración no llegara, se asume que **no** las gestiona el cliente: el aviso de más es
   * inofensivo, y un botón de invitar que la API va a rechazar con un 403 no lo es.
   */
  const residentsManagedByClient = configResponse.data?.residentsManagedByClient ?? false;

  return (
    <>
      <ViewHeader title={t('Residents.title')} description={t('Residents.description')} />

      <CommunitiesResidentsPanel
        serviceId={serviceId}
        locale={locale}
        residents={
          residentsResponse.data ?? { items: [], pagination: { page: 1, limit: residentsLimit, totalItems: 0, totalPages: 1 } }
        }
        invitations={
          invitationsResponse.data ?? {
            items: [],
            pagination: { page: 1, limit: invitationsLimit, totalItems: 0, totalPages: 1 },
          }
        }
        units={unitsResponse.data ?? []}
        keyrings={keyringsResponse.data ?? []}
        locks={locksResponse.data ?? []}
        includeClosed={includeClosed}
        residentsManagedByClient={residentsManagedByClient}
      />
    </>
  );
}
