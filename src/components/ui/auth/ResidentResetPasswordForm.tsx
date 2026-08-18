'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Form, Formik } from 'formik';
import { CheckCircle, LockIcon } from 'lucide-react';

import Input from '@/components/ui/inputs/Input';
import Button from '@/components/ui/buttons/Button';

import { resetResidentPassword } from '@/actions/auth/resident-auth-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { residentResetPasswordSchema } from '@/schemas/auth.schema';

import '@/styles/04-components/auth/authForm.scss';

interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

const INITIAL: ResetPasswordValues = { newPassword: '', confirmPassword: '' };

interface ResidentResetPasswordFormProps {
  token: string;
}

/**
 * Formulario de restablecimiento de contraseña de un vecino, a partir del token del enlace de recuperación
 * enviado por correo desde la app móvil. A diferencia del portal de cliente, no hay a dónde "volver a iniciar
 * sesión" en esta web: el vecino entra siempre desde la app, así que el estado de éxito lo remite ahí.
 * @param {ResidentResetPasswordFormProps} props - Token del enlace
 * @returns {JSX.Element} El formulario renderizado
 */
export default function ResidentResetPasswordForm({ token }: ResidentResetPasswordFormProps) {
  const t = useTranslations('Views.Auth.Resident.ResetPassword');
  const tErrors = useTranslations('Common.Errors');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: ResetPasswordValues) => {
    setError(null);
    const response = await resetResidentPassword({ token, password: values.newPassword });

    if (response.status === HTTPStatus.OK || response.status === HTTPStatus.NO_CONTENT) {
      setSuccess(true);
      return;
    }

    setError(response.message ?? tErrors('unexpectedError'));
  };

  if (success) {
    return (
      <div className="auth-form auth-form--success">
        <div className="auth-form__success">
          <CheckCircle aria-hidden="true" />
          <h1 className="auth-form__title">{t('successTitle')}</h1>
          <p>{t('successMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <Formik
      initialValues={INITIAL}
      validationSchema={residentResetPasswordSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
        <Form className="auth-form" noValidate>
          <div className="auth-form__header">
            <h1 className="auth-form__title">{t('title')}</h1>
            <p className="auth-form__subtitle">{t('subtitle')}</p>
          </div>

          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            label="newPassword"
            placeholder="newPassword"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.newPassword}
            error={errors.newPassword}
            required
            icon={LockIcon}
            className="input__full"
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="confirmPassword"
            placeholder="confirmPassword"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.confirmPassword}
            error={errors.confirmPassword}
            required
            icon={LockIcon}
            className="input__full"
          />

          {error && <p className="auth-form__error">{error}</p>}

          <Button
            title={isSubmitting ? 'submitting' : 'submit'}
            type="submit"
            size="full"
            variant="primary"
            disabled={isSubmitting}
          />
        </Form>
      )}
    </Formik>
  );
}
