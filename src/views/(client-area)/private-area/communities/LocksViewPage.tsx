import { getTranslations } from 'next-intl/server';
import { InfoIcon } from 'lucide-react';

import { getCommunityLocksPaginated, getLockSchedule } from '@/actions/client-portal/community-locks-actions';

import ClientListEmptyState from '@/components/ui/client-area/ClientListEmptyState';
import ClientListPagination from '@/components/ui/client-area/ClientListPagination';
import ClientListSearch from '@/components/ui/client-area/ClientListSearch';
import LockCard from '@/components/ui/client-area/community/LockCard';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';
import '@/styles/04-components/client-area/community-schedule.scss';

const LOCKS_PER_PAGE = 10;

interface LocksViewPageProps {
  serviceId: string;
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de puertas: cada cerradura con su estado, su horario semanal, sus
 * excepciones y su liberación temporal. Los horarios se piden en paralelo
 * junto al listado para que cada tarjeta se pinte ya completa, sin un segundo
 * salto de carga por puerta.
 *
 * A diferencia del resto de listados del portal, esta pantalla no usa el
 * componente `Table`: cada `LockCard` es una tarjeta rica con su propio
 * horario semanal cargado en paralelo, no una fila tabular, así que sigue el
 * patrón más simple de paginación/búsqueda por URL (`ClientListSearch` +
 * `ClientListPagination`) en vez de `useClientTableUrlState`. Sin orden: la
 * rejilla de tarjetas no lo necesita.
 * @param {LocksViewPageProps} props - Comunidad activa, locale y query params
 * @returns {Promise<JSX.Element>} La pantalla de puertas renderizada
 */
export default async function LocksViewPage({ serviceId, locale, searchParams }: LocksViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const search = searchParams.q?.trim() || undefined;

  const locksResponse = await getCommunityLocksPaginated(serviceId, {
    page,
    limit: LOCKS_PER_PAGE,
    search,
  });

  const locks = locksResponse.data?.items ?? [];
  const pagination = locksResponse.data?.pagination;

  const schedules = await Promise.all(locks.map((lock) => getLockSchedule(lock.id)));

  return (
    <>
      <header className="community-layout__header">
        <h1 className="community-layout__title">{t('Locks.title')}</h1>
        <p className="community-layout__description">{t('Locks.description')}</p>
      </header>

      <p className="community-notice">
        <InfoIcon aria-hidden="true" />
        {t('Locks.readOnlyNotice')}
      </p>

      <ClientListSearch placeholder={t('Locks.searchPlaceholder')} />

      {locks.length > 0 ? (
        locks.map((lock, index) => (
          <LockCard
            key={lock.id}
            lock={lock}
            locale={locale}
            schedule={schedules[index]?.data ?? null}
          />
        ))
      ) : (
        <ClientListEmptyState
          resource="locks"
          title={t('Locks.emptyTitle')}
          description={t('Locks.emptyDescription')}
        />
      )}

      <ClientListPagination
        basePath="/private-area/communities/[serviceId]/locks"
        params={{ serviceId }}
        currentPage={pagination?.page ?? page}
        totalPages={pagination?.totalPages ?? 1}
        searchParams={{ q: search }}
      />
    </>
  );
}
