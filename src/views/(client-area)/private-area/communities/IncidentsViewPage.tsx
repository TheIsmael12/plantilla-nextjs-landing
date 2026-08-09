import { getTranslations } from 'next-intl/server';
import { InfoIcon } from 'lucide-react';

import { getCommunityIncidents } from '@/actions/client-portal/community-incidents-actions';
import { formatBillingDate } from '@/utils/billingFormatUtils';
import {
  INCIDENT_PRIORITY_VARIANTS,
  INCIDENT_STATUS_VARIANTS,
} from '@/utils/communityFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import ClientListEmptyState from '@/components/ui/client-area/ClientListEmptyState';
import ClientListPagination from '@/components/ui/client-area/ClientListPagination';
import StatusFilter from '@/components/ui/client-area/StatusFilter';
import { Link, resolveDetailHref } from '@/i18n/navigation';

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

interface IncidentsViewPageProps {
  serviceId: string;
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de incidencias de la comunidad: el único listado paginado del módulo.
 * Es de solo lectura a propósito — las incidencias se crean y se gestionan
 * desde la app del vecino y desde el backoffice, no desde el portal. El
 * backend ya excluye las sensibles, así que aquí no hay (ni debe haber) ningún
 * control para pedirlas.
 * @param {IncidentsViewPageProps} props - Comunidad activa, locale y query params
 * @returns {Promise<JSX.Element>} La pantalla de incidencias renderizada
 */
export default async function IncidentsViewPage({
  serviceId,
  locale,
  searchParams,
}: IncidentsViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const status = STATUS_OPTIONS.includes(searchParams.status as IncidentStatus)
    ? (searchParams.status as IncidentStatus)
    : undefined;

  const response = await getCommunityIncidents({
    page,
    limit: INCIDENTS_PER_PAGE,
    status,
    clientServiceId: serviceId,
  });

  const incidents = response.data?.items ?? [];
  const pagination = response.data?.pagination;

  return (
    <>
      <header className="community-layout__header">
        <h1 className="community-layout__title">{t('Incidents.title')}</h1>
        <p className="community-layout__description">{t('Incidents.description')}</p>
      </header>

      <p className="community-notice">
        <InfoIcon aria-hidden="true" />
        {t('Incidents.readOnlyNotice')}
      </p>

      <StatusFilter
        label={tCommon('filterLabel')}
        allLabel={tCommon('filterAll')}
        activeStatus={status}
        options={STATUS_OPTIONS.map((value) => ({
          value,
          label: t(`IncidentStatus.${value}`),
        }))}
      />

      {incidents.length > 0 ? (
        <>
          <div className="community-table__scroll">
            <table className="community-table">
              <thead>
                <tr>
                  <th>{t('Incidents.codeColumn')}</th>
                  <th>{t('Incidents.typeColumn')}</th>
                  <th>{t('Incidents.unitColumn')}</th>
                  <th>{t('Incidents.reportedByColumn')}</th>
                  <th>{t('Incidents.priorityColumn')}</th>
                  <th>{t('Incidents.statusColumn')}</th>
                  <th>{t('Incidents.createdAtColumn')}</th>
                  <th>{tCommon('viewDetail')}</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>
                      <strong>{incident.code}</strong>
                      <br />
                      <span className="community-table__muted">{incident.title}</span>
                    </td>
                    <td>{incident.typeName}</td>
                    <td>
                      {incident.communityUnitCode ?? (
                        <span className="community-table__muted">{t('Incidents.noUnit')}</span>
                      )}
                    </td>
                    <td>
                      {incident.reportedByResidentName ?? (
                        <span className="community-table__muted">
                          {t('Incidents.unknownResident')}
                        </span>
                      )}
                    </td>
                    <td>
                      <Badge
                        variant={INCIDENT_PRIORITY_VARIANTS[incident.priority]}
                        text={t(`IncidentPriority.${incident.priority}`)}
                      />
                    </td>
                    <td>
                      <Badge
                        variant={INCIDENT_STATUS_VARIANTS[incident.status]}
                        text={t(`IncidentStatus.${incident.status}`)}
                      />
                      {incident.isOverdue && (
                        <>
                          <br />
                          <Badge variant="danger" text={t('Incidents.overdue')} />
                        </>
                      )}
                    </td>
                    <td>
                      {formatBillingDate(incident.createdAt, locale, tCommon('notAvailable'))}
                    </td>
                    <td>
                      <Link
                        href={resolveDetailHref('/private-area/incidents/[id]', incident.id)}
                        className="client-list__link"
                      >
                        {tCommon('viewDetail')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ClientListPagination
            basePath={`/private-area/communities/${serviceId}/incidents`}
            currentPage={pagination?.page ?? page}
            totalPages={pagination?.totalPages ?? 1}
            searchParams={{ status }}
          />
        </>
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
