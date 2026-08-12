'use client';

import { useState, useTransition } from 'react';

import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react';

import { updatePreferences } from '@/actions/client-portal/preferences-actions';
import type { PortalPreferences } from '@/types/client-portal/preferences';
import { notifyResponse } from '@/utils/toastUtils';

import CardRadioGroup from '@/components/ui/inputs/CardRadioGroup';
import SettingsSection from '@/components/ui/sections/SettingsSection';

import '@/styles/04-components/client-area/portal-preferences.scss';

interface PortalThemeSectionProps {
  initialTheme: PortalPreferences['theme'];
}

/**
 * Selector de tema de `/private-area/profile/preferences/theme`, propia
 * subpágina igual que en intranet: tarjetas con miniatura de cada tema, cambia
 * al instante vía `next-themes` y persiste en segundo plano.
 * @param {PortalThemeSectionProps} props - Tema guardado al cargar la página
 * @returns {JSX.Element} La sección de preferencia de tema renderizada
 */
export default function PortalThemeSection({ initialTheme }: PortalThemeSectionProps) {
  const t = useTranslations('Views.ClientArea.Profile.Preferences.Theme');
  const tErrors = useTranslations('Common.Errors');
  const { setTheme } = useTheme();
  const { update } = useSession();

  const [theme, setThemeValue] = useState(initialTheme);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    setThemeValue(value as PortalPreferences['theme']);
    setTheme(value);

    startTransition(async () => {
      const response = await updatePreferences({ theme: value as PortalPreferences['theme'] });
      notifyResponse(response, tErrors('unexpectedError'));
      if (response.data) await update({ preferences: response.data });
    });
  };

  return (
    <SettingsSection title={t('title')} description={t('description')} icon={SunMoonIcon}>
      <CardRadioGroup
        name="theme"
        value={theme}
        onChange={handleChange}
        disabled={isPending}
        options={[
          {
            value: 'light',
            label: t('light'),
            description: t('lightDescription'),
            icon: SunIcon,
            preview: (
              <div className="portal-theme-preview portal-theme-preview--light">
                <span className="portal-theme-preview__bar" />
                <span className="portal-theme-preview__line" />
                <span className="portal-theme-preview__line portal-theme-preview__line--short" />
              </div>
            ),
          },
          {
            value: 'dark',
            label: t('dark'),
            description: t('darkDescription'),
            icon: MoonIcon,
            preview: (
              <div className="portal-theme-preview portal-theme-preview--dark">
                <span className="portal-theme-preview__bar" />
                <span className="portal-theme-preview__line" />
                <span className="portal-theme-preview__line portal-theme-preview__line--short" />
              </div>
            ),
          },
        ]}
      />
    </SettingsSection>
  );
}
