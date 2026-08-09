'use client';

import { useState, useTransition } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { LanguagesIcon } from 'lucide-react';

import { usePathname, useRouter, type AnyHref } from '@/i18n/navigation';

import { updatePreferences } from '@/actions/client-portal/preferences-actions';
import { LANGUAGES } from '@/config/settings';
import type { AppLocale } from '@/config/locales';
import { notifyResponse } from '@/utils/toastUtils';

import ChangeLocale from '@/components/ui/inputs/ChangeLocale';
import SettingsSection from '@/components/ui/sections/SettingsSection';

interface PortalLocaleSectionProps {
  initialLocale: AppLocale;
}

/**
 * Selector de idioma de `/private-area/profile/preferences/locale`: reutiliza
 * `ChangeLocale`, navega a la misma ruta bajo el nuevo locale al elegir un
 * idioma, y persiste la elección como preferencia del cliente. Mismo patrón
 * que `plantilla-nextjs`.
 * @param {PortalLocaleSectionProps} props - Idioma activo al cargar la página
 * @returns {JSX.Element} La sección de preferencia de idioma renderizada
 */
export default function PortalLocaleSection({ initialLocale }: PortalLocaleSectionProps) {
  const t = useTranslations('Views.ClientArea.Profile.Preferences.Locale');
  const tErrors = useTranslations('Common.Errors');
  const router = useRouter();
  const pathname = usePathname();
  const { update } = useSession();

  const [locale, setLocale] = useState(initialLocale);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: AppLocale) => {
    setLocale(value);

    router.replace(pathname as AnyHref, { locale: value });
    router.refresh();

    startTransition(async () => {
      const response = await updatePreferences({ language: value });
      notifyResponse(response, tErrors('unexpectedError'));
      if (response.data) await update({ preferences: response.data });
    });
  };

  return (
    <SettingsSection title={t('title')} description={t('description')} icon={LanguagesIcon}>
      <ChangeLocale
        label={t('title')}
        description={t('fieldDescription')}
        value={locale}
        options={LANGUAGES}
        onChange={handleChange}
        disabled={isPending}
      />
    </SettingsSection>
  );
}
