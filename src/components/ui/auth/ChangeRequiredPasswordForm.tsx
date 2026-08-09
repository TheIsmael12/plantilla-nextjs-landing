'use client';

import { useState, useTransition } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Form, Formik } from 'formik';
import { LockIcon } from 'lucide-react';

import { useRouter } from '@/i18n/navigation';

import Input from '@/components/ui/inputs/Input';
import Button from '@/components/ui/buttons/Button';

import { changeRequiredPasswordSchema } from '@/schemas/auth.schema';

import '@/styles/04-components/auth/authForm.scss';

interface ChangeRequiredPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

const INITIAL: ChangeRequiredPasswordValues = { newPassword: '', confirmPassword: '' };

interface ChangeRequiredPasswordFormProps {
  changeToken: string;
}

/**
 * Formulario de cambio de contraseña obligatorio, mostrado tras un login
 * cuya cuenta todavía tiene una contraseña provisional
 * (`requiresPasswordChange`). Al completarse, `authorize()` de NextAuth crea
 * la sesión directamente (no hace falta volver a introducir credenciales).
 * @param {ChangeRequiredPasswordFormProps} props - Propiedades del formulario
 * @returns {JSX.Element} El formulario renderizado
 */
export default function ChangeRequiredPasswordForm({ changeToken }: ChangeRequiredPasswordFormProps) {
  const t = useTranslations('Views.Auth.ChangePasswordRequired');
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (values: ChangeRequiredPasswordValues) => {
    startTransition(async () => {
      const response = await signIn('credentials', {
        changeToken,
        newPassword: values.newPassword,
        redirect: false,
      });

      if (response?.ok) {
        await getSession();
        router.push('/private-area');
        return;
      }

      setError(response?.error || null);
    });
  };

  return (
    <Formik
      initialValues={INITIAL}
      validationSchema={changeRequiredPasswordSchema}
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
            title={isSubmitting || isPending ? 'submitting' : 'submit'}
            type="submit"
            size="full"
            variant="primary"
            disabled={isSubmitting || isPending}
          />
        </Form>
      )}
    </Formik>
  );
}
