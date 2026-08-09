'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { KeyRoundIcon } from 'lucide-react';

import { useRouter } from '@/i18n/navigation';

import OtpCodeModal from '@/components/ui/modals/OtpCodeModal';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import Input from '@/components/ui/inputs/Input';

import { decodePasswordChangeRequired } from '@/utils/mfaUtils';

interface PortalMfaVerifyModalProps {
  isOpen: boolean;
  challengeToken: string;
  onClose: () => void;
  onVerified: () => void | Promise<void>;
}

/**
 * Modal de verificación en dos pasos del login del portal de cliente: pide
 * el código de 6 dígitos de la app autenticadora y reintenta el `signIn` de
 * NextAuth con el `challengeToken` pendiente. Ofrece una alternativa con un
 * código de recuperación (si el cliente no tiene acceso a su app). Si tras
 * verificar la API todavía exige fijar una nueva contraseña
 * (`requiresPasswordChange`), redirige a `/change-password` en vez de
 * completar el login.
 * @param {PortalMfaVerifyModalProps} props - Propiedades del modal
 * @returns {JSX.Element} El modal de verificación 2FA
 */
export default function PortalMfaVerifyModal({
  isOpen,
  challengeToken,
  onClose,
  onVerified,
}: PortalMfaVerifyModalProps) {
  const t = useTranslations('Views.Auth.Mfa');
  const router = useRouter();

  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | undefined>();
  const [isSubmittingRecovery, setIsSubmittingRecovery] = useState(false);

  const finishSignIn = async (credentials: { code?: string; recoveryCode?: string }): Promise<string | void> => {
    const response = await signIn('credentials', {
      challengeToken,
      ...credentials,
      redirect: false,
    });

    if (response?.ok) {
      await onVerified();
      return;
    }

    const changeToken = decodePasswordChangeRequired(response?.error);
    if (changeToken) {
      router.push({ pathname: '/change-password', query: { token: changeToken } });
      return;
    }

    return response?.error || undefined;
  };

  if (useRecoveryCode) {
    const handleRecoverySubmit = async () => {
      setIsSubmittingRecovery(true);
      const error = await finishSignIn({ recoveryCode });
      setIsSubmittingRecovery(false);
      if (error) setRecoveryError(error);
    };

    return (
      <ModalComponent
        isOpen={isOpen}
        title={t('recoveryTitle')}
        onClose={onClose}
        closeOnOutsideClick={false}
        onConfirm={handleRecoverySubmit}
        confirmVariant="primary"
        confirmText="verify"
        isLoading={isSubmittingRecovery}
        isLoadingText="verifying"
        confirmDisabled={recoveryCode.trim().length === 0}
        footerError={recoveryError}
      >
        <div>
          <p>{t('recoveryDescription')}</p>
          <Input
            id="recoveryCode"
            name="recoveryCode"
            type="text"
            label="recoveryCode"
            placeholder="recoveryCode"
            noTranslate
            value={recoveryCode}
            onChange={(e) => {
              setRecoveryCode(e.target.value);
              if (recoveryError) setRecoveryError(undefined);
            }}
            icon={KeyRoundIcon}
            className="input__full"
          />
          <button
            type="button"
            className="auth-form__back-to-login"
            onClick={() => setUseRecoveryCode(false)}
          >
            {t('useAuthenticatorApp')}
          </button>
        </div>
      </ModalComponent>
    );
  }

  return (
    <OtpCodeModal
      isOpen={isOpen}
      title={t('title')}
      description={t('description')}
      onClose={onClose}
      onSubmit={(code) => finishSignIn({ code })}
      footerContent={
        <button
          type="button"
          className="auth-form__back-to-login"
          onClick={() => setUseRecoveryCode(true)}
        >
          {t('useRecoveryCode')}
        </button>
      }
    />
  );
}
