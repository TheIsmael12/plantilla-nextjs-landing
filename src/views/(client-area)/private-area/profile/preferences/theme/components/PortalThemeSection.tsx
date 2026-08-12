'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';
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
 * al instante y persiste en segundo plano.
 *
 * El cambio en vivo no lo da `next-themes` (`setTheme`): el `ThemeProvider` raíz usa `forcedTheme` para
 * que el tema de la persona gane siempre a `localStorage` desde el primer frame (evita el flash al tema
 * equivocado al iniciar sesión en otro dispositivo/navegador), y mientras `forcedTheme` tiene valor
 * `next-themes` ignora cualquier `setTheme` posterior. Por eso aquí se pinta la clase directamente sobre
 * `<html>` para el efecto instantáneo, y `router.refresh()` tras guardar recalcula `forcedTheme` en el
 * layout de servidor con el valor nuevo — sin eso, la próxima navegación revertiría al tema anterior.
 * @param {PortalThemeSectionProps} props - Tema guardado al cargar la página
 * @returns {JSX.Element} La sección de preferencia de tema renderizada
 */
export default function PortalThemeSection({ initialTheme }: PortalThemeSectionProps) {
  const t = useTranslations('Views.ClientArea.Profile.Preferences.Theme');
  const tErrors = useTranslations('Common.Errors');
  const router = useRouter();
  const { update } = useSession();

  const [theme, setThemeValue] = useState(initialTheme);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    setThemeValue(value as PortalPreferences['theme']);
    document.documentElement.classList.toggle('dark', value === 'dark');
    document.documentElement.style.colorScheme = value;

    startTransition(async () => {
      const response = await updatePreferences({ theme: value as PortalPreferences['theme'] });
      notifyResponse(response, tErrors('unexpectedError'));
      if (response.data) {
        await update({ preferences: response.data });
        router.refresh();
      }
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
