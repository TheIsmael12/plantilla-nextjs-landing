import { getTranslations } from 'next-intl/server';

import { getCommunityKeyrings } from '@/actions/client-portal/community-keyrings-actions';
import {
  getCommunityInvitations,
  getCommunityResidentsPaginated,
} from '@/actions/client-portal/community-residents-actions';
import { getCommunityUnits } from '@/actions/client-portal/community-units-actions';

import ResidentsManager from '@/components/ui/client-area/community/ResidentsManager';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';

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
 * búsqueda de cada tabla) en `ResidentsManager`.
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
export default async function ResidentsViewPage({
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

  const [residentsResponse, invitationsResponse, unitsResponse, keyringsResponse] =
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
    ]);

  return (
    <>
      <header className="community-layout__header">
        <h1 className="community-layout__title">{t('Residents.title')}</h1>
        <p className="community-layout__description">{t('Residents.description')}</p>
      </header>

      <ResidentsManager
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
        includeClosed={includeClosed}
      />
    </>
  );
}
