'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Form, Formik } from 'formik';
import { CheckCircle, IdCardIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import Input from '@/components/ui/inputs/Input';
import Button from '@/components/ui/buttons/Button';

import { forgotClientPortalPassword } from '@/actions/auth/client-portal-auth-actions';
import { forgotPasswordSchema } from '@/schemas/auth.schema';

import '@/styles/04-components/auth/authForm.scss';

interface ForgotPasswordValues {
  taxId: string;
}

const INITIAL: ForgotPasswordValues = { taxId: '' };

/**
 * Formulario de recuperación de acceso: pide el CIF/NIF y solicita al
 * backend el enlace de restablecimiento. Siempre muestra el mismo mensaje
 * de éxito, exista o no ese CIF/NIF registrado (anti-enumeración, igual que
 * el propio backend).
 * @returns {JSX.Element} El formulario renderizado
 */
export default function ForgotPasswordForm() {
  const t = useTranslations('Views.Auth.ForgotPassword');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: ForgotPasswordValues) => {
    await forgotClientPortalPassword(values.taxId.trim());
    setSuccess(true);
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
    <Formik initialValues={INITIAL} validationSchema={forgotPasswordSchema} onSubmit={handleSubmit}>
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
        <Form className="auth-form" noValidate>
          <div className="auth-form__header">
            <h1 className="auth-form__title">{t('title')}</h1>
            <p className="auth-form__subtitle">{t('subtitle')}</p>
          </div>

          <Input
            id="taxId"
            name="taxId"
            type="text"
            label="taxId"
            placeholder="taxId"
            autoComplete="username"
            value={values.taxId}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.taxId}
            error={errors.taxId}
            required
            icon={IdCardIcon}
            className="input__full"
          />

          <Button
            title={isSubmitting ? 'submitting' : 'submit'}
            type="submit"
            size="full"
            variant="primary"
            disabled={isSubmitting}
          />

          <p className="auth-form__back-to-login">
            <Link href="/login">{t('backToLogin')}</Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
