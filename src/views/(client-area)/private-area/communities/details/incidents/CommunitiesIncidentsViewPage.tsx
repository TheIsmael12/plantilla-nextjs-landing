import { getTranslations } from 'next-intl/server';
import { InfoIcon } from 'lucide-react';

import { getCommunityIncidents } from '@/actions/client-portal/community-incidents-actions';

import ClientListEmptyState from '@/views/(client-area)/private-area/components/ClientListEmptyState';
import IncidentsTable from '@/views/(client-area)/private-area/components/IncidentsTable';

import type { IncidentStatus } from '@/types/client-portal/community';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

const INCIDENTS_PER_PAGE = 10;

const STATUS_OPTIONS: IncidentStatus[] = [
  'NUEVA',
  'EN_CURSO',
  'ESPERANDO_TERCERO',
  'RESUELTA',
  'CERRADA',
  'RECHAZADA',
];

interface IncidentsViewPageProps {
  serviceId: string;
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de incidencias de la comunidad: el único listado paginado del módulo.
 *
 * Usa **la misma tabla que la lista general** (`IncidentsTable`), con sus filtros, su paginación y su orden
 * por columna. Antes era una tabla escrita a mano con su propio filtro de estado y su propia paginación: dos
 * listados de lo mismo, con distinto aspecto y distintas capacidades según por dónde entraras —desde la
 * comunidad no se podía ordenar ni cambiar el tamaño de página—. Aquí se le pide además las columnas de
 * vivienda y de quién la abrió, que es lo que distingue a esta pantalla.
 *
 * Es de solo lectura a propósito — las incidencias se crean y se gestionan desde la app del vecino y desde el
 * backoffice, no desde el portal. El backend ya excluye las sensibles, así que aquí no hay (ni debe haber)
 * ningún control para pedirlas.
 * @param {IncidentsViewPageProps} props - Comunidad activa, locale y query params
 * @returns {Promise<JSX.Element>} La pantalla de incidencias renderizada
 */
export default async function CommunitiesIncidentsViewPage({
  serviceId,
  locale,
  searchParams,
}: IncidentsViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities');

  /*
   * Los parámetros se leen de la URL, que es donde los deja la tabla.
   *
   * `IncidentsTable` sincroniza página, tamaño, orden y filtro con la query string, así que esta vista solo
   * tiene que traducirlos a la petición. Se validan aquí y no se reenvían tal cual: un `status` inventado en
   * la URL respondería un 400 y dejaría la pantalla en blanco en vez de enseñar la lista sin filtrar.
   */
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const limit = Number(searchParams.limit) > 0 ? Number(searchParams.limit) : INCIDENTS_PER_PAGE;
  const status = STATUS_OPTIONS.includes(searchParams.status as IncidentStatus)
    ? (searchParams.status as IncidentStatus)
    : undefined;
  const sortBy = searchParams.sortBy || undefined;
  const sortOrder =
    searchParams.sortOrder === 'ASC' ? 'ASC' : searchParams.sortOrder === 'DESC' ? 'DESC' : undefined;
  const dateFrom = searchParams.dateFrom?.trim() || undefined;
  const dateTo = searchParams.dateTo?.trim() || undefined;
  const search = searchParams.q?.trim() || undefined;

  const response = await getCommunityIncidents({
    page,
    limit,
    status,
    sortBy,
    sortOrder,
    clientServiceId: serviceId,
    dateFrom,
    dateTo,
    search,
  });

  return (
    <>
      <ViewHeader title={t('Incidents.title')} description={t('Incidents.description')} />

      <p className="community-notice">
        <InfoIcon aria-hidden="true" />
        {t('Incidents.readOnlyNotice')}
      </p>

      {/*
        Con un filtro puesto se pinta la tabla aunque no haya resultados: el vacío tiene que enseñar el filtro
        para poder quitarlo. Con el estado vacío se leería «esta comunidad no tiene incidencias», que es
        mentira cuando lo que pasa es que ninguna cumple el filtro.
      */}
      {response.data && (response.data.pagination.totalItems > 0 || status || search) ? (
        <IncidentsTable
          data={response.data}
          locale={locale}
          statusOptions={STATUS_OPTIONS}
          showCommunityColumns
        />
      ) : (
        <ClientListEmptyState
          resource="incidents"
          title={t('Incidents.emptyTitle')}
          description={t('Incidents.emptyDescription')}
        />
      )}
    </>
  );
}
