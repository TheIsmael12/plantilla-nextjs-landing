import { getTranslations } from 'next-intl/server';
import { ArrowRightIcon, DoorClosedIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import { formatCommunityDateTime } from '@/utils/communityFormatUtils';

import type { AnyHref } from '@/i18n/navigation';
import type { LockAccessSummary } from '@/types/client-portal/community';

import '@/styles/04-components/client-area/community-home.scss';

interface CommunityAccessOverviewProps {
  serviceId: string;
  summaries: LockAccessSummary[];
  locale: string;
}

/**
 * El registro de accesos en la portada: una fila por puerta, sin identificar a nadie.
 *
 * Es la misma información que la pantalla de registro de accesos, en formato de resumen. **No lleva el
 * detalle nominal**, ni el botón para pedirlo: ese detalle exige justificar el motivo y queda auditado, y una
 * portada es una pantalla por la que se pasa sin querer nada en concreto. Quien de verdad va a mirar quién
 * entró llega desde el enlace del pie, donde el trámite está donde tiene que estar.
 * @param {CommunityAccessOverviewProps} props - Comunidad, el resumen ya cargado y el locale
 * @returns {Promise<JSX.Element>} El resumen de accesos renderizado
 */
export default async function CommunityAccessOverview({
  serviceId,
  summaries,
  locale,
}: CommunityAccessOverviewProps) {
  const t = await getTranslations('Views.ClientArea.Communities.Home');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  if (summaries.length === 0) {
    return <p className="community-home__empty">{t('accessEmpty')}</p>;
  }

  return (
    <>
      <ul className="community-home__doors">
        {summaries.map((summary) => (
          <li key={summary.lockId} className="community-home__door">
            <p className="community-home__door-name">
              <DoorClosedIcon aria-hidden="true" />
              {summary.lockName}
            </p>

            <dl className="community-home__door-figures">
              <div>
                <dt>{t('accessGranted')}</dt>
                <dd>{summary.granted}</dd>
              </div>
              <div>
                <dt>{t('accessDenied')}</dt>
                <dd>{summary.denied}</dd>
              </div>
              <div>
                <dt>{t('accessBySchedule')}</dt>
                <dd>{summary.deniedBySchedule}</dd>
              </div>
            </dl>

            <p className="community-home__door-last">
              {t('accessLastAt', {
                date: formatCommunityDateTime(
                  summary.lastAccessAt,
                  locale,
                  tCommon('notAvailable'),
                ),
              })}
            </p>
          </li>
        ))}
      </ul>

      <Link
        href={`/private-area/communities/${serviceId}/access-log` as AnyHref}
        className="community-home__more"
      >
        {t('accessMore')}
        <ArrowRightIcon aria-hidden="true" />
      </Link>
    </>
  );
}
