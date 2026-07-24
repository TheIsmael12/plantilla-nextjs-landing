"use client";

import "@/styles/04-components/ui/modals/two-factor-disable-modal.scss";

import type { FormikHelpers } from "formik";
import { useTranslations } from "next-intl";

import { disableTwoFactor } from "@/actions/profile/security-actions";
import { HTTPStatus } from "@/constants/httpStatus";
import { disableTwoFactorSchema } from "@/schemas/security.schema";

import ModalComponent from "@/components/ui/modals/ModalComponent";
import Input from "@/components/ui/inputs/Input";
import OtpInput from "@/components/ui/inputs/OtpInput";

import type { TwoFactorDisableModalProps } from "@/types/ui/modals/two-factor-disable-modal";
import type { TwoFactorDisablePayload } from "@/types/profile/security";

import { LockIcon } from "lucide-react";

/**
 * Pide confirmación (contraseña actual + código de la aplicación
 * autenticadora) antes de desactivar la verificación en dos pasos (§7.1
 * requisitos.md): una acción sensible, no basta con un simple "¿seguro?".
 * @param {TwoFactorDisableModalProps} props - Propiedades del modal
 * @returns {JSX.Element} El modal de desactivación de verificación en dos pasos
 */
export default function TwoFactorDisableModal({
  onClose,
  onDisabled,
}: TwoFactorDisableModalProps) {
  const t = useTranslations("Views.Profile.Security.TwoFactor.Disable");
  const tErrors = useTranslations("Common.Errors");

  const handleSubmit = async (
    values: TwoFactorDisablePayload,
    helpers: FormikHelpers<TwoFactorDisablePayload>,
  ) => {
    const response = await disableTwoFactor(values);

    if (response.status === HTTPStatus.OK) {
      await onDisabled();
      return;
    }

    helpers.setFieldError("code", response.message ?? tErrors("unexpectedError"));
  };

  return (
    <ModalComponent<TwoFactorDisablePayload>
      title={t("title")}
      isOpen
      onClose={onClose}
      closeOnOutsideClick={false}
      initialValues={{ password: "", code: "" }}
      validationSchema={disableTwoFactorSchema}
      onSubmit={handleSubmit}
      submitText="deactivate"
      submittingText="deactivating"
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
        <div className="two-factor-disable-modal">
          <p className="two-factor-disable-modal__description">{t("description")}</p>

          <Input
            id="password"
            name="password"
            type="password"
            label="password"
            placeholder="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.password}
            error={errors.password}
            required
            disabled={isSubmitting}
            icon={LockIcon}
            className="input__full"
          />

          <OtpInput
            id="code"
            name="code"
            value={values.code}
            onChange={(value) => setFieldValue("code", value)}
            error={errors.code}
            touched={touched.code}
            disabled={isSubmitting}
          />
        </div>
      )}
    </ModalComponent>
  );
}
