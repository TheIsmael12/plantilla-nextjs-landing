import { getTranslations } from 'next-intl/server';
import { Building2Icon } from 'lucide-react';

import { getClientCommunities } from '@/actions/client-portal/communities-actions';
import { formatServiceAddress } from '@/utils/addressFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import ClientListEmptyState from '@/views/(client-area)/private-area/components/ClientListEmptyState';
import { Link } from '@/i18n/navigation';

import type { AnyHref } from '@/i18n/navigation';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

/**
 * Vista de `/private-area/communities`: selector de comunidades. Con una sola
 * comunidad el enlace de la cabecera ya entra directo en ella, así que esta
 * pantalla es sobre todo la salida para quien tiene varias (o llega aquí a
 * mano).
 * @returns {Promise<JSX.Element>} El selector de comunidades renderizado
 */
export default async function CommunitiesViewPage() {
  const t = await getTranslations('Views.ClientArea.Communities');

  const response = await getClientCommunities();
  const communities = response.data ?? [];

  return (
    <>
      <ViewHeader title={t('selectorTitle')} />

      {communities.length > 0 ? (
        <>
          <p className="view-header__description">{t('selectorDescription')}</p>

          <div className="community-card__grid">
            {communities.map((community) => (
              <Link
                key={community.serviceId}
                href={`/private-area/communities/${community.serviceId}` as AnyHref}
                className="community-card"
              >
                <span className="community-card__icon">
                  <Building2Icon aria-hidden="true" />
                </span>

                <div>
                  <span className="community-card__code">{community.serviceCode}</span>
                  <h2 className="community-card__title">
                    {formatServiceAddress(community.address) ?? community.serviceName}
                  </h2>
                </div>

                <div className="community-card__modules">
                  {community.incidentsEnabled && (
                    <Badge variant="info" text={t('Modules.incidents')} />
                  )}
                  {community.keyringEnabled && (
                    <Badge variant="info" text={t('Modules.keyring')} />
                  )}
                  {community.noticeboardEnabled && (
                    <Badge variant="info" text={t('Modules.noticeboard')} />
                  )}
                </div>

                <div className="community-card__stats">
                  <div className="community-card__stat">
                    <span className="community-card__stat-value">{community.units}</span>
                    <span className="community-card__stat-label">{t('unitsCount')}</span>
                  </div>
                  <div className="community-card__stat">
                    <span className="community-card__stat-value">{community.residents}</span>
                    <span className="community-card__stat-label">{t('residentsCount')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <ClientListEmptyState
          resource="communities"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      )}
    </>
  );
}
