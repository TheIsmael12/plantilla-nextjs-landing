'use client';

import { useMemo, useState, useTransition } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { ClockIcon } from 'lucide-react';

import { updatePreferences } from '@/actions/client-portal/preferences-actions';
import type { PortalPreferences } from '@/types/client-portal/preferences';
import { notifyResponse } from '@/utils/toastUtils';

import RadioGroup from '@/components/ui/inputs/RadioGroup';
import SelectSearch from '@/components/ui/inputs/SelectSearch';
import SettingsSection from '@/components/ui/sections/SettingsSection';

interface PortalDateTimeSectionProps {
  initialPreferences: Pick<
    PortalPreferences,
    'timezone' | 'dateFormat' | 'timeFormat' | 'firstDayOfWeek'
  >;
}

/** Campo editable de esta sección: cada uno se guarda de forma independiente al cambiar. */
type DateTimeField = keyof PortalDateTimeSectionProps['initialPreferences'];

/** Patrones de fecha ofrecidos (mismos que `DATE_FORMAT_OPTIONS` de `plantilla-nextjs`). */
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

/**
 * Zona horaria y formatos de fecha/hora de
 * `/private-area/profile/preferences/datetime`, separado del idioma: mismo
 * diseño que `plantilla-nextjs` (`RadioGroup` para los formatos, `SelectSearch`
 * con el catálogo IANA completo para la zona horaria, cada campo autoguarda
 * su propio cambio sin un botón de guardar único).
 * @param {PortalDateTimeSectionProps} props - Preferencias de fecha/hora guardadas al cargar la página
 * @returns {JSX.Element} La sección de fecha y hora renderizada
 */
export default function PortalDateTimeSection({
  initialPreferences,
}: PortalDateTimeSectionProps) {
  const t = useTranslations('Views.ClientArea.Profile.Preferences.DateTime');
  const tErrors = useTranslations('Common.Errors');
  const { update } = useSession();

  const [values, setValues] = useState(initialPreferences);
  const [pendingField, setPendingField] = useState<DateTimeField | null>(null);
  const [, startTransition] = useTransition();

  const timezoneOptions = useMemo(
    () => Intl.supportedValuesOf('timeZone').map((zone) => ({ value: zone, label: zone })),
    [],
  );

  const handleChange = (field: DateTimeField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setPendingField(field);

    startTransition(async () => {
      const response = await updatePreferences({ [field]: value });
      setPendingField(null);
      notifyResponse(response, tErrors('unexpectedError'));
      if (response.data) await update({ preferences: response.data });
    });
  };

  return (
    <SettingsSection title={t('title')} description={t('description')} icon={ClockIcon}>
      <RadioGroup
        name="dateFormat"
        label={t('dateFormat')}
        description={t('dateFormatDescription')}
        value={values.dateFormat}
        onChange={(value) => handleChange('dateFormat', value)}
        disabled={pendingField === 'dateFormat'}
        options={DATE_FORMATS.map((format) => ({ value: format, label: format }))}
      />

      <RadioGroup
        name="timeFormat"
        label={t('timeFormat')}
        description={t('timeFormatDescription')}
        value={values.timeFormat}
        onChange={(value) => handleChange('timeFormat', value)}
        disabled={pendingField === 'timeFormat'}
        options={[
          { value: '24h', label: t('timeFormat24h') },
          { value: '12h', label: t('timeFormat12h') },
        ]}
      />

      <RadioGroup
        name="firstDayOfWeek"
        label={t('firstDayOfWeek')}
        description={t('firstDayOfWeekDescription')}
        value={values.firstDayOfWeek}
        onChange={(value) => handleChange('firstDayOfWeek', value)}
        disabled={pendingField === 'firstDayOfWeek'}
        options={[
          { value: 'MONDAY', label: t('monday') },
          { value: 'SUNDAY', label: t('sunday') },
        ]}
      />

      <SelectSearch
        name="timezone"
        label={t('timezone')}
        description={t('timezoneDescription')}
        noTranslate
        value={values.timezone}
        onChange={(value) => handleChange('timezone', value)}
        disabled={pendingField === 'timezone'}
        options={timezoneOptions}
        className="select__md"
      />
    </SettingsSection>
  );
}
