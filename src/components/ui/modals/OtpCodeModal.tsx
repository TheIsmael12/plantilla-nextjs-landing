"use client";

import "@/styles/04-components/ui/modals/otp-code-modal.scss";

import { useState } from "react";

import { OTP_CODE_LENGTH } from "@/config/settings";

import ModalComponent from "@/components/ui/modals/ModalComponent";
import OtpInput from "@/components/ui/inputs/OtpInput";

import type { OtpCodeModalProps } from "@/types/ui/modals/otp-code-modal";

import { ShieldCheckIcon } from "lucide-react";

/**
 * Modal dedicado exclusivamente a pedir un código de 6 dígitos: lo comparten
 * el reto MFA del login (`MfaVerifyModal`) y la confirmación de alta de 2FA
 * (`TwoFactorSetupModal`).
 */
export default function OtpCodeModal({
  isOpen,
  title,
  description,
  submitText = "verify",
  submittingText = "verifying",
  onClose,
  onSubmit,
}: OtpCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (value: string) => {
    setCode(value);
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const submitError = await onSubmit(code);
    setIsSubmitting(false);

    if (submitError) setError(submitError);
  };

  return (
    <ModalComponent
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      closeOnOutsideClick={false}
      onConfirm={handleSubmit}
      confirmVariant="primary"
      confirmText={submitText}
      isLoading={isSubmitting}
      isLoadingText={submittingText}
      confirmDisabled={code.length !== OTP_CODE_LENGTH}
    >
      <div className="otp-code-modal">
        <div className="otp-code-modal__icon">
          <ShieldCheckIcon aria-hidden="true" />
        </div>

        <h2 className="otp-code-modal__title">{title}</h2>
        <p className="otp-code-modal__description">{description}</p>

        <OtpInput
          id="otpCode"
          name="otpCode"
          value={code}
          onChange={handleChange}
          autoFocus
        />

        {error && <p className="otp-code-modal__error">{error}</p>}
      </div>
    </ModalComponent>
  );
}
