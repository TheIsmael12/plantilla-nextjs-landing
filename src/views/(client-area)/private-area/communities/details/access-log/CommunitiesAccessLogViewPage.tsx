import { getTranslations } from 'next-intl/server';
import { ShieldAlertIcon } from 'lucide-react';

import { getCommunityAccessSummary } from '@/actions/client-portal/community-locks-actions';

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
 * Vista del registro de accesos: siempre visible el resumen agregado por
 * puerta, que no identifica a nadie, y detrás de un motivo justificado el
 * detalle nominal. La separación es del dominio, no cosmética: el endpoint de
 * detalle exige un `reason` que el backend audita.
 * @param {AccessLogViewPageProps} props - Comunidad activa y locale
 * @returns {Promise<JSX.Element>} La pantalla del registro de accesos renderizada
 */
export default async function CommunitiesAccessLogViewPage({
  serviceId,
  locale,
}: AccessLogViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities');

  const response = await getCommunityAccessSummary(serviceId);
  const summaries = response.data ?? [];

  return (
    <>
      <ViewHeader title={t('AccessLog.title')} description={t('AccessLog.description')} />

      <p className="community-notice">
        <ShieldAlertIcon aria-hidden="true" />
        {t('AccessLog.aggregatedNotice')}
      </p>

      {summaries.length > 0 ? (
        <AccessLogSummary summaries={summaries} locale={locale} />
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
