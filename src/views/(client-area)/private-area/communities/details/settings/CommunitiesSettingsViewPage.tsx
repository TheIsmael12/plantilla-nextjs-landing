import { getTranslations } from 'next-intl/server';
import { LockIcon } from 'lucide-react';

import { getCommunityConfig } from '@/actions/client-portal/communities-actions';

import SettingsSection from '@/components/ui/sections/SettingsSection';
import CommunitiesSettingsPanel from '@/views/(client-area)/private-area/communities/details/settings/components/CommunitiesSettingsPanel';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

interface CommunitySettingsViewPageProps {
  serviceId: string;
}

/**
 * Vista de configuración de la comunidad: lo editable en un formulario y, en
 * un bloque aparte claramente marcado, lo que fija el contrato y el cliente no
 * puede tocar (`isEnabled`, `keyringEnabled`, `maxResidents`,
 * `residentsManagedByClient`, `timeZone`).
 * @param {CommunitySettingsViewPageProps} props - Comunidad activa
 * @returns {Promise<JSX.Element>} La pantalla de configuración renderizada
 */
export default async function CommunitiesSettingsViewPage({
  serviceId,
}: CommunitySettingsViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities');

  const response = await getCommunityConfig(serviceId);
  const config = response.data;

  if (!config) {
    return (
      <>
        <header className="view-header">
          <h1 className="view-header__title">{t('Settings.title')}</h1>
        </header>
        <p className="community-empty">{t('loadError')}</p>
      </>
    );
  }

  return (
    <>
      <ViewHeader title={t('Settings.title')} description={t('Settings.description')} />

      <CommunitiesSettingsPanel serviceId={serviceId} config={config} />

      <SettingsSection
        title={t('Settings.readOnlyTitle')}
        description={t('Settings.readOnlyDescription')}
        icon={LockIcon}
      >
        <dl className="community-facts">
          <div className="community-facts__item">
            <dt className="community-facts__label">{t('Settings.isEnabled')}</dt>
            <dd className="community-facts__value">
              {config.isEnabled ? t('Settings.yes') : t('Settings.no')}
            </dd>
          </div>
          <div className="community-facts__item">
            <dt className="community-facts__label">{t('Settings.keyringEnabled')}</dt>
            <dd className="community-facts__value">
              {config.keyringEnabled ? t('Settings.yes') : t('Settings.no')}
            </dd>
          </div>
          <div className="community-facts__item">
            <dt className="community-facts__label">{t('Settings.maxResidents')}</dt>
            <dd className="community-facts__value">{config.maxResidents}</dd>
          </div>
          <div className="community-facts__item">
            <dt className="community-facts__label">{t('Settings.activeResidents')}</dt>
            <dd className="community-facts__value">{config.activeResidents}</dd>
          </div>
          <div className="community-facts__item">
            <dt className="community-facts__label">
              {t('Settings.residentsManagedByClient')}
            </dt>
            <dd className="community-facts__value">
              {config.residentsManagedByClient ? t('Settings.yes') : t('Settings.no')}
            </dd>
          </div>
          <div className="community-facts__item">
            <dt className="community-facts__label">{t('Settings.timeZone')}</dt>
            <dd className="community-facts__value">{config.timeZone}</dd>
          </div>
        </dl>
      </SettingsSection>
    </>
  );
}
