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
import BreadcrumbLabel from '@/components/ui/navigations/BreadcrumbLabel';
import IncidentCloseForm from '@/views/(client-area)/private-area/incidents/details/components/IncidentCloseForm';
import IncidentConversation from '@/views/(client-area)/private-area/incidents/details/components/IncidentConversation';
import IncidentStatusMenu from '@/views/(client-area)/private-area/incidents/details/components/IncidentStatusMenu';

import '@/styles/04-components/client-area/client-detail.scss';
import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/incident-detail.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

interface IncidentDetailViewPageProps {
  id: string;
  locale: string;
}

/**
 * Vista de `/private-area/incidents/[id]`: todos los datos de la incidencia y
 * el formulario para comentarla.
 *
 * No se pintan controles de estado ni de asignación aunque la respuesta traiga
 * `allowedTransitions`: ese campo describe lo que puede hacer el personal
 * interno desde intranet, no lo que puede hacer el cliente. El cliente no
 * gestiona el flujo interno de la incidencia, pero sí puede confirmar su
 * resolución y valorarla con estrellas ({@link IncidentCloseForm}) mientras
 * está `RESUELTA`; una vez cerrada, se enseña la valoración ya dada.
 * @param {IncidentDetailViewPageProps} props - Id de la incidencia y locale activo
 * @returns {Promise<JSX.Element>} El detalle de la incidencia renderizado
 */
export default async function IncidentsDetailsViewPage({
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

  if (!incident) {
    return (
      <>
        <h1 className="client-detail__title">{t('notFoundTitle')}</h1>
        <p className="client-detail__empty">{t('notFoundDescription')}</p>
      </>
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
    <>
      <BreadcrumbLabel label={incident.code} />

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

          {/*
            El menú de tres puntos: la vía para que el cliente dé la incidencia por resuelta él mismo,
            sin esperar a que el staff la marque primero. Ni en `RESUELTA` —ahí ya está el flujo dedicado
            de `IncidentCloseForm`, más abajo— ni en un estado terminal, donde no hay nada que ofrecer.
          */}
          {(incident.status === 'NUEVA' ||
            incident.status === 'EN_CURSO' ||
            incident.status === 'ESPERANDO_TERCERO') && (
            <IncidentStatusMenu incidentId={incident.id} />
          )}
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

          {/*
            El titular es a propósito «Tu incidencia se ha resuelto» y no solo «Resolución»: es la
            noticia, y va con tono de éxito porque pide una acción del cliente —confirmarla con estrellas,
            justo debajo en `IncidentCloseForm`—. El bloque neutro de antes se leía como un dato más de la
            ficha, y se perdía entre el resto.
          */}
          {incident.resolution && (
            <section className="incident-detail__block incident-detail__block--success">
              <h2 className="incident-detail__block-title incident-detail__block-title--success">
                {t('resolvedNoticeTitle')}
              </h2>
              <p className="incident-detail__resolution-subtitle">{t('resolutionLabel')}</p>
              <p className="incident-detail__text">{incident.resolution}</p>
            </section>
          )}

          {/*
            Confirmar y valorar solo mientras está RESUELTA: antes no tiene nada que confirmar, y una
            vez CERRADA ya se valoró (o la cerró el staff sin valoración, y no se puede rellenar
            retroactivamente desde aquí).
          */}
          {incident.status === 'RESUELTA' && <IncidentCloseForm incidentId={incident.id} />}

          {incident.status === 'CERRADA' && incident.satisfactionRating && (
            <section className="incident-detail__block">
              <h2 className="incident-detail__block-title">{t('ratingLabel')}</h2>
              <p className="incident-detail__text">
                {t('alreadyRated', { rating: incident.satisfactionRating })}
              </p>
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
    </>
  );
}
