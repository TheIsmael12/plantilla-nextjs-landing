import { getTranslations } from 'next-intl/server';
import { ShieldAlertIcon } from 'lucide-react';

import {
  getCommunityAccessSummary,
  getCommunityLocks,
} from '@/actions/client-portal/community-locks-actions';

import ClientListEmptyState from '@/views/(client-area)/private-area/components/ClientListEmptyState';
import AccessLogSummary from '@/views/(client-area)/private-area/communities/details/access-log/components/AccessLogSummary';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

interface AccessLogViewPageProps {
  serviceId: string;
  locale: string;
}

/**
 * La pantalla del registro de accesos: el resumen por puerta y, debajo, el historial de aperturas.
 *
 * **Ya no hay que justificar un motivo para mirarlo**, igual que en la intranet: se exigía escribirlo para
 * poder ver una sola fila y no protegía nada, porque quien llega hasta aquí lo mira igual. La consulta se
 * sigue auditando en el servidor, que es lo que sí deja rastro de quién ha mirado.
 * @param {AccessLogViewPageProps} props - Comunidad activa y locale
 * @returns {Promise<JSX.Element>} La pantalla del registro de accesos renderizada
 */
export default async function CommunitiesAccessLogViewPage({
  serviceId,
  locale,
}: AccessLogViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities');

  /*
   * Las puertas hacen falta para el filtro del historial, y se piden a la vez que el resumen: son dos
   * llamadas independientes y en serie solo sumarían espera.
   */
  const [summaryResponse, locksResponse] = await Promise.all([
    getCommunityAccessSummary(serviceId),
    getCommunityLocks(serviceId),
  ]);

  const summaries = summaryResponse.data ?? [];
  const locks = locksResponse.data ?? [];

  return (
    <>
      <ViewHeader title={t('AccessLog.title')} description={t('AccessLog.description')} />

      <p className="community-notice">
        <ShieldAlertIcon aria-hidden="true" />
        {t('AccessLog.aggregatedNotice')}
      </p>

      {locks.length > 0 ? (
        <AccessLogSummary
          serviceId={serviceId}
          summaries={summaries}
          locks={locks}
          locale={locale}
        />
      ) : (
        <ClientListEmptyState
          resource="accessLog"
          title={t('AccessLog.emptyTitle')}
          description={t('AccessLog.emptyDescription')}
        />
      )}
    </>
  );
}
