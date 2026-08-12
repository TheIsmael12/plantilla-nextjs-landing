import { getTranslations } from 'next-intl/server';

import { getCommunityUnitsPaginated } from '@/actions/client-portal/community-units-actions';

import CommunitiesUnitsPanel from '@/views/(client-area)/private-area/communities/details/units/components/CommunitiesUnitsPanel';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

const UNITS_PER_PAGE = 10;

interface UnitsViewPageProps {
  serviceId: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de unidades de una comunidad: portales, viviendas, locales y zonas
 * comunes del edificio. La paginación, orden y búsqueda las resuelve el
 * backend a partir de los query params (`page`/`limit`/`sortBy`/`sortOrder`/
 * `q`), gestionados por `useClientTableUrlState` dentro de `UnitsTable`.
 * @param {UnitsViewPageProps} props - Comunidad activa y query params
 * @returns {Promise<JSX.Element>} La pantalla de unidades renderizada
 */
export default async function CommunitiesUnitsViewPage({ serviceId, searchParams }: UnitsViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const limit = Number(searchParams.limit) > 0 ? Number(searchParams.limit) : UNITS_PER_PAGE;
  const search = searchParams.q?.trim() || undefined;
  const sortBy = searchParams.sortBy || undefined;
  const sortOrder =
    searchParams.sortOrder === 'ASC' ? 'ASC' : searchParams.sortOrder === 'DESC' ? 'DESC' : undefined;

  const response = await getCommunityUnitsPaginated(serviceId, {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  return (
    <>
      <ViewHeader title={t('Units.title')} description={t('Units.description')} />

      <CommunitiesUnitsPanel
        serviceId={serviceId}
        units={response.data ?? { items: [], pagination: { page: 1, limit, totalItems: 0, totalPages: 1 } }}
      />
    </>
  );
}
