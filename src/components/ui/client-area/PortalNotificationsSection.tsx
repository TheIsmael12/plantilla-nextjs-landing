'use client';

import { useState, useTransition } from 'react';

import { useTranslations } from 'next-intl';
import { BellIcon } from 'lucide-react';

import { updatePreferences } from '@/actions/client-portal/preferences-actions';
import { notifyResponse } from '@/utils/toastUtils';

import Toggle from '@/components/ui/inputs/Toggle';
import SettingsSection from '@/components/ui/sections/SettingsSection';

interface PortalNotificationsSectionProps {
  initialInAppNotifications: boolean;
}

/**
 * Preferencia de notificaciones de
 * `/private-area/profile/preferences/notifications`: un único interruptor
 * para la campana. Sin interruptor de email ni resumen semanal —a diferencia
 * de intranet—: los tipos de notificación del portal (presupuesto enviado,
 * factura emitida...) solo llevan canal `IN_APP` hoy y no hay resumen
 * semanal para clientes, así que esos controles no tendrían nada real detrás.
 * @param {PortalNotificationsSectionProps} props - Preferencia guardada al cargar la página
 * @returns {JSX.Element} La sección de preferencias de notificación renderizada
 */
export default function PortalNotificationsSection({
  initialInAppNotifications,
}: PortalNotificationsSectionProps) {
  const t = useTranslations('Views.ClientArea.Profile.Preferences.Notifications');
  const tErrors = useTranslations('Common.Errors');

  const [checked, setChecked] = useState(initialInAppNotifications);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: boolean) => {
    setChecked(value);

    startTransition(async () => {
      const response = await updatePreferences({ inAppNotifications: value });
      notifyResponse(response, tErrors('unexpectedError'));
      if (response.data) setChecked(response.data.inAppNotifications);
    });
  };

  return (
    <SettingsSection title={t('title')} description={t('description')} icon={BellIcon}>
      <Toggle
        name="inAppNotifications"
        label={t('inAppNotifications')}
        description={t('inAppNotificationsDescription')}
        checked={checked}
        onChange={handleChange}
        disabled={isPending}
      />
    </SettingsSection>
  );
}
