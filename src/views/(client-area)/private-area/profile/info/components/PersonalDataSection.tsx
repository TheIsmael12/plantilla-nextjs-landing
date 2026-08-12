import { useTranslations } from 'next-intl';
import { UserIcon } from 'lucide-react';

import SettingsSection from '@/components/ui/sections/SettingsSection';

import type { PortalClientMeResponseData } from '@/types/client-portal/profile';

import '@/styles/04-components/client-area/profile-info.scss';

interface PersonalDataSectionProps {
  profile: PortalClientMeResponseData;
}

/**
 * Sección de datos personales de `/profile`: solo lectura, el backend no
 * expone edición de estos campos desde el portal (los gestiona el
 * backoffice). Mismo patrón que `ProfilePersonalInfoSection` de intranet
 * (`dl`/`dt`/`dd` dentro de una `SettingsSection`), sin el bloque de
 * verificación de email (el portal no tiene ese concepto).
 * @param {PersonalDataSectionProps} props - Propiedades del componente
 * @returns {JSX.Element} La sección de datos personales renderizada
 */
export default function PersonalDataSection({ profile }: PersonalDataSectionProps) {
  const t = useTranslations('Views.ClientArea.Profile.PersonalData');

  return (
    <SettingsSection title={t('title')} icon={UserIcon}>
      <dl className="profile-info__list">
        <div className="profile-info__row">
          <dt className="profile-info__term">{t('clientCode')}</dt>
          <dd className="profile-info__value">{profile.clientCode}</dd>
        </div>

        <div className="profile-info__row">
          <dt className="profile-info__term">{t('name')}</dt>
          <dd className="profile-info__value">{profile.name}</dd>
        </div>

        <div className="profile-info__row">
          <dt className="profile-info__term">{t('email')}</dt>
          <dd className="profile-info__value">
            {profile.email || <span className="profile-info__placeholder">{t('noEmail')}</span>}
          </dd>
        </div>

        <div className="profile-info__row">
          <dt className="profile-info__term">{t('phone')}</dt>
          <dd className="profile-info__value">
            {profile.phone || <span className="profile-info__placeholder">{t('noPhone')}</span>}
          </dd>
        </div>
      </dl>
    </SettingsSection>
  );
}
