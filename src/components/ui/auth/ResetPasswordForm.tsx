'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Form, Formik } from 'formik';
import { CheckCircle, LockIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import Input from '@/components/ui/inputs/Input';
import Button from '@/components/ui/buttons/Button';

import { resetClientPortalPassword } from '@/actions/auth/client-portal-auth-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { resetPasswordSchema } from '@/schemas/auth.schema';

import '@/styles/04-components/auth/authForm.scss';

interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

const INITIAL: ResetPasswordValues = { newPassword: '', confirmPassword: '' };

interface ResetPasswordFormProps {
  token: string;
}

/**
 * Formulario de restablecimiento de contraseña a partir del token recibido
 * en el enlace de recuperación de acceso.
 * @param {ResetPasswordFormProps} props - Propiedades del formulario
 * @returns {JSX.Element} El formulario renderizado
 */
export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations('Views.Auth.ResetPassword');
  const tErrors = useTranslations('Common.Errors');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: ResetPasswordValues) => {
    setError(null);
    const response = await resetClientPortalPassword({ token, newPassword: values.newPassword });

    if (response.status === HTTPStatus.OK) {
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
        <p className="auth-form__back-to-login">
          <Link href="/login">{t('backToLogin')}</Link>
        </p>
      </div>
    );
  }

  return (
    <Formik initialValues={INITIAL} validationSchema={resetPasswordSchema} onSubmit={handleSubmit}>
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
