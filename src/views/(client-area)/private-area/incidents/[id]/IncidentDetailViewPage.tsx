import { getTranslations } from 'next-intl/server';
import { ArrowLeftIcon } from 'lucide-react';

import {
  getIncidentComments,
  getIncidentDetail,
} from '@/actions/client-portal/community-incidents-actions';
import { formatBillingDate } from '@/utils/billingFormatUtils';
import {
  INCIDENT_PRIORITY_VARIANTS,
  INCIDENT_STATUS_VARIANTS,
} from '@/utils/communityFormatUtils';
import { Link, resolveHref } from '@/i18n/navigation';

import Badge from '@/components/ui/buttons/Badge';
import IncidentConversation from '@/components/ui/client-area/IncidentConversation';

import '@/styles/04-components/client-area/client-detail.scss';
import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/incident-detail.scss';

interface IncidentDetailViewPageProps {
  id: string;
  locale: string;
}

/**
 * Vista de `/private-area/incidents/[id]`: todos los datos de la incidencia y
 * el formulario para comentarla.
 *
 * No se pintan controles de estado ni de asignación aunque la respuesta traiga
 * `allowedTransitions`: ese campo es de gestión interna y el cliente solo crea
 * y comenta.
 * @param {IncidentDetailViewPageProps} props - Id de la incidencia y locale activo
 * @returns {Promise<JSX.Element>} El detalle de la incidencia renderizado
 */
export default async function IncidentDetailViewPage({
  id,
  locale,
}: IncidentDetailViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities.Incidents');
  const tCommunities = await getTranslations('Views.ClientArea.Communities');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  const [response, commentsResponse] = await Promise.all([
    getIncidentDetail(id),
    getIncidentComments(id),
  ]);
  const incident = response.data;
  const comments = commentsResponse.data ?? [];

  const backLink = (
    <Link href={resolveHref('/private-area/incidents')} className="client-area-page__back">
      <ArrowLeftIcon size={16} aria-hidden="true" />
      {tCommon('backToList')}
    </Link>
  );

  if (!incident) {
    return (
      <main className="client-area-page">
        {backLink}
        <h1 className="client-detail__title">{t('notFoundTitle')}</h1>
        <p className="client-detail__empty">{t('notFoundDescription')}</p>
      </main>
    );
  }

  // Dos bloques, mismo criterio que el sidebar de intranet ("Propiedades" y
  // "Plazos"): agrupar por tipo de dato en vez de una lista plana hace que
  // se puedan escanear de un vistazo en vez de leer etiqueta por etiqueta.
  const properties: { label: string; value: string }[] = [
    { label: t('typeColumn'), value: incident.typeName },
    { label: t('channelLabel'), value: incident.channelName },
    {
      label: t('serviceLabel'),
      value: incident.clientServiceName ?? tCommon('notAvailable'),
    },
    {
      label: t('assignedToLabel'),
      value: incident.assignedToName ?? t('unassigned'),
    },
  ];

  const dates: { label: string; value: string }[] = [
    {
      label: t('createdAtColumn'),
      value: formatBillingDate(incident.createdAt, locale, tCommon('notAvailable')),
    },
    {
      label: t('dueAtLabel'),
      value: formatBillingDate(incident.dueAt ?? undefined, locale, tCommon('notAvailable')),
    },
    {
      label: t('resolvedAtLabel'),
      value: formatBillingDate(
        incident.resolvedAt ?? undefined,
        locale,
        tCommon('notAvailable'),
      ),
    },
    {
      label: t('closedAtLabel'),
      value: formatBillingDate(incident.closedAt ?? undefined, locale, tCommon('notAvailable')),
    },
  ];

  return (
    <main className="client-area-page">
      {backLink}

      <header className="client-detail__header">
        <div>
          <h1 className="client-detail__title">{incident.code}</h1>
          <p className="client-detail__subtitle">{incident.title}</p>
        </div>
        <div className="incident-detail__badges">
          <Badge
            variant={INCIDENT_STATUS_VARIANTS[incident.status]}
            text={tCommunities(`IncidentStatus.${incident.status}`)}
          />
          <Badge
            variant={INCIDENT_PRIORITY_VARIANTS[incident.priority]}
            text={tCommunities(`IncidentPriority.${incident.priority}`)}
          />
          {incident.isOverdue && <Badge variant="danger" text={t('overdue')} />}
        </div>
      </header>

      {/* Dos columnas, mismo criterio que la intranet: la conversación es lo que se viene a hacer
          aquí, y las propiedades quedan siempre a la vista al lado en vez de obligar a bajar. */}
      <div className="incident-detail__layout">
        <div>
          <section className="incident-detail__block">
            <h2 className="incident-detail__block-title">{t('descriptionLabel')}</h2>
            <p className="incident-detail__text">{incident.description}</p>
          </section>

          {incident.resolution && (
            <section className="incident-detail__block">
              <h2 className="incident-detail__block-title">{t('resolutionLabel')}</h2>
              <p className="incident-detail__text">{incident.resolution}</p>
            </section>
          )}

          <IncidentConversation incidentId={incident.id} locale={locale} comments={comments} />
        </div>

        <aside className="incident-detail__aside">
          <section className="incident-detail__sidebar-block">
            <h2 className="incident-detail__sidebar-title">{t('propertiesTitle')}</h2>
            <dl className="incident-detail__grid">
              {properties.map((detail) => (
                <div key={detail.label} className="incident-detail__field">
                  <dt className="incident-detail__label">{detail.label}</dt>
                  <dd className="incident-detail__value">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="incident-detail__sidebar-block">
            <h2 className="incident-detail__sidebar-title">{t('datesTitle')}</h2>
            <dl className="incident-detail__grid">
              {dates.map((detail) => (
                <div key={detail.label} className="incident-detail__field">
                  <dt className="incident-detail__label">{detail.label}</dt>
                  <dd className="incident-detail__value">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
