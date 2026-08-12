'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SaveIcon, SettingsIcon } from 'lucide-react';

import { updateCommunityConfig } from '@/actions/client-portal/communities-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import Input from '@/components/ui/inputs/Input';
import Select from '@/components/ui/inputs/Select';
import SettingsSection from '@/components/ui/sections/SettingsSection';
import Toggle from '@/components/ui/inputs/Toggle';

import type { PortalCommunityConfig, ResidentRole } from '@/types/client-portal/community';

import '@/styles/04-components/ui/forms/form-row.scss';
import '@/styles/04-components/client-area/community-common.scss';

const ROLES: ResidentRole[] = ['PROPIETARIO', 'INQUILINO', 'PRESIDENTE', 'ADMINISTRADOR'];
const MIN_OPEN_INCIDENTS = 1;
const MAX_OPEN_INCIDENTS = 100;
const MIN_PHOTOS = 1;
const MAX_PHOTOS = 20;

interface CommunitySettingsFormProps {
  serviceId: string;
  config: PortalCommunityConfig;
}

/**
 * Formulario de los campos editables de la configuración. Solo envía la lista
 * blanca que acepta el backend: los valores fijados por contrato se muestran
 * aparte, nunca en un control editable. Impide además dejar los dos métodos de
 * inicio de sesión desactivados, que el backend rechaza con un 400.
 * @param {CommunitySettingsFormProps} props - Comunidad activa y configuración actual
 * @returns {JSX.Element} El formulario de configuración renderizado
 */
export default function CommunitiesSettingsPanel({
  serviceId,
  config,
}: CommunitySettingsFormProps) {
  const t = useTranslations('Views.ClientArea.Communities');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    incidentsEnabled: config.incidentsEnabled,
    noticeboardEnabled: config.noticeboardEnabled,
    allowGoogleSignIn: config.allowGoogleSignIn,
    allowPasswordSignIn: config.allowPasswordSignIn,
    defaultResidentRole: config.defaultResidentRole,
    maxOpenIncidentsPerResident: config.maxOpenIncidentsPerResident,
    maxPhotosPerIncident: config.maxPhotosPerIncident,
  });

  const hasSignInMethod = form.allowGoogleSignIn || form.allowPasswordSignIn;

  const handleSave = () => {
    startTransition(async () => {
      const response = await updateCommunityConfig(serviceId, form);
      notifyResponse(response, t('loadError'));

      if (response.status === HTTPStatus.OK || response.status === HTTPStatus.CREATED) {
        router.refresh();
      }
    });
  };

  return (
    <SettingsSection
      title={t('Settings.title')}
      description={t('Settings.description')}
      icon={SettingsIcon}
      actions={
        <Button
          variant="primary"
          title="save"
          onClick={handleSave}
          disabled={isPending || !hasSignInMethod}
        >
          <SaveIcon />
        </Button>
      }
    >
      <div className="community-form">
        <div className="form-rows">
          <div className="form-row form-row--cols-2">
            <Toggle
              name="incidentsEnabled"
              label={t('Settings.incidentsEnabled')}
              description={t('Settings.incidentsEnabledHelp')}
              checked={form.incidentsEnabled}
              onChange={(checked) => setForm({ ...form, incidentsEnabled: checked })}
            />

            <Toggle
              name="noticeboardEnabled"
              label={t('Settings.noticeboardEnabled')}
              description={t('Settings.noticeboardEnabledHelp')}
              checked={form.noticeboardEnabled}
              onChange={(checked) => setForm({ ...form, noticeboardEnabled: checked })}
            />
          </div>

          <div className="form-row form-row--cols-2">
            <Toggle
              name="allowGoogleSignIn"
              label={t('Settings.allowGoogleSignIn')}
              description={t('Settings.allowGoogleSignInHelp')}
              checked={form.allowGoogleSignIn}
              onChange={(checked) => setForm({ ...form, allowGoogleSignIn: checked })}
            />

            <Toggle
              name="allowPasswordSignIn"
              label={t('Settings.allowPasswordSignIn')}
              description={t('Settings.allowPasswordSignInHelp')}
              checked={form.allowPasswordSignIn}
              onChange={(checked) => setForm({ ...form, allowPasswordSignIn: checked })}
            />
          </div>
        </div>

        {!hasSignInMethod && (
          <p className="community-form__error">{t('Settings.signInRequired')}</p>
        )}

        <div className="form-row form-row--cols-3">
          <Select
            name="defaultResidentRole"
            label={t('Settings.defaultResidentRole')}
            noTranslate
            placeholder={t('Settings.defaultResidentRolePlaceholder')}
            description={t('Settings.defaultResidentRoleHelp')}
            className="select__full"
            value={form.defaultResidentRole}
            onChange={(value) =>
              setForm({ ...form, defaultResidentRole: value as ResidentRole })
            }
            options={ROLES.map((role) => ({
              value: role,
              label: t(`ResidentRole.${role}`),
            }))}
          />

          <div className="community-form__field">
            <Input
              id="settings-max-incidents"
              name="maxOpenIncidentsPerResident"
              type="number"
              label={t('Settings.maxOpenIncidentsPerResident')}
              noTranslate
              className="input__full"
              min={MIN_OPEN_INCIDENTS}
              max={MAX_OPEN_INCIDENTS}
              value={String(form.maxOpenIncidentsPerResident)}
              onChange={(event) =>
                setForm({
                  ...form,
                  maxOpenIncidentsPerResident: Number(event.target.value),
                })
              }
            />
            <span className="community-form__help">
              {t('Settings.maxOpenIncidentsPerResidentHelp')}
            </span>
          </div>

          <div className="community-form__field">
            <Input
              id="settings-max-photos"
              name="maxPhotosPerIncident"
              type="number"
              label={t('Settings.maxPhotosPerIncident')}
              noTranslate
              className="input__full"
              min={MIN_PHOTOS}
              max={MAX_PHOTOS}
              value={String(form.maxPhotosPerIncident)}
              onChange={(event) =>
                setForm({ ...form, maxPhotosPerIncident: Number(event.target.value) })
              }
            />
            <span className="community-form__help">
              {t('Settings.maxPhotosPerIncidentHelp')}
            </span>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
