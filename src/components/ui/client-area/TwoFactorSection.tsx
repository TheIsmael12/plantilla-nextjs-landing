'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { KeyRoundIcon, ShieldCheckIcon } from 'lucide-react';

import { regenerateClientTwoFactorRecoveryCodes } from '@/actions/client-portal/profile-actions';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import Toggle from '@/components/ui/inputs/Toggle';
import BackupCodesModal from '@/components/ui/modals/BackupCodesModal';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import TwoFactorDisableModal from '@/components/ui/modals/TwoFactorDisableModal';
import TwoFactorSetupModal from '@/components/ui/modals/TwoFactorSetupModal';
import SettingsSection from '@/components/ui/sections/SettingsSection';

import '@/styles/04-components/client-area/profile-security.scss';

interface TwoFactorSectionProps {
  initialEnabled: boolean;
}

/**
 * Sección de verificación en dos pasos de `/profile/security`: un `Toggle`
 * refleja el estado actual y, al cambiarlo, abre la confirmación
 * correspondiente ({@link TwoFactorSetupModal} para activar,
 * {@link TwoFactorDisableModal} para desactivar) — el `Toggle` solo cambia
 * de verdad cuando esa confirmación se completa, así que cancelar lo deja
 * tal y como estaba. Los códigos de recuperación tienen su propia tarjeta,
 * visible solo con la verificación activa, con confirmación antes de
 * regenerarlos (invalida los anteriores) y revelándolos una única vez con
 * {@link BackupCodesModal}. Mismo patrón que `ProfileTwoFactorSection` de intranet.
 * @param {TwoFactorSectionProps} props - Propiedades del componente
 * @returns {JSX.Element} La sección de verificación en dos pasos renderizada
 */
export default function TwoFactorSection({ initialEnabled }: TwoFactorSectionProps) {
  const t = useTranslations('Views.ClientArea.Profile.TwoFactor');
  const tRecoveryCodes = useTranslations('Views.ClientArea.Profile.TwoFactor.RecoveryCodes');
  const tErrors = useTranslations('Common.Errors');

  const [enabled, setEnabled] = useState(initialEnabled);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isRegenerating, startRegenerate] = useTransition();

  const fetchAndShowRecoveryCodes = async () => {
    const response = await regenerateClientTwoFactorRecoveryCodes();
    notifyResponse(response, tErrors('unexpectedError'));
    if (response.data) setBackupCodes(response.data);
  };

  const handleVerified = async () => {
    setEnabled(true);
    setIsSetupOpen(false);
    await fetchAndShowRecoveryCodes();
  };

  const handleDisabled = () => {
    setEnabled(false);
    setIsDisableOpen(false);
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setIsSetupOpen(true);
    } else {
      setIsDisableOpen(true);
    }
  };

  const handleRegenerateConfirm = () => {
    setIsRegenerateConfirmOpen(false);
    startRegenerate(fetchAndShowRecoveryCodes);
  };

  return (
    <>
      <SettingsSection title={t('title')} description={t('description')} icon={ShieldCheckIcon}>
        <div className="profile-two-factor-section__toggle">
          <Toggle
            id="two-factor-toggle"
            name="twoFactorEnabled"
            label={t(enabled ? 'enabled' : 'disabled')}
            description={t(enabled ? 'enabledHint' : 'disabledHint')}
            checked={enabled}
            onChange={handleToggle}
          />
        </div>
      </SettingsSection>

      {enabled && (
        <SettingsSection
          title={tRecoveryCodes('title')}
          description={tRecoveryCodes('description')}
          icon={KeyRoundIcon}
          actions={
            <Button
              title={isRegenerating ? 'regeneratingCodes' : 'regenerateCodes'}
              variant="outline"
              onClick={() => setIsRegenerateConfirmOpen(true)}
              disabled={isRegenerating}
            />
          }
        />
      )}

      {isSetupOpen && (
        <TwoFactorSetupModal onClose={() => setIsSetupOpen(false)} onVerified={handleVerified} />
      )}

      {isDisableOpen && (
        <TwoFactorDisableModal onClose={() => setIsDisableOpen(false)} onDisabled={handleDisabled} />
      )}

      {isRegenerateConfirmOpen && (
        <ModalComponent
          title={tRecoveryCodes('confirmTitle')}
          isOpen
          onClose={() => setIsRegenerateConfirmOpen(false)}
          onCancel={() => setIsRegenerateConfirmOpen(false)}
          onConfirm={handleRegenerateConfirm}
          confirmVariant="primary"
          confirmText="regenerateCodes"
        >
          <p>{tRecoveryCodes('confirmDescription')}</p>
        </ModalComponent>
      )}

      {backupCodes && <BackupCodesModal codes={backupCodes} onClose={() => setBackupCodes(null)} />}
    </>
  );
}
