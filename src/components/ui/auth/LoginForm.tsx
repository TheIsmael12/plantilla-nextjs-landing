'use client';

import { useState, useTransition } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Form, Formik } from 'formik';
import { IdCardIcon, LockIcon } from 'lucide-react';

import { Link, useRouter, type AnyHref } from '@/i18n/navigation';

import Input from '@/components/ui/inputs/Input';
import Button from '@/components/ui/buttons/Button';
import PortalMfaVerifyModal from '@/views/auth/PortalMfaVerifyModal';

import { loginSchema } from '@/schemas/auth.schema';
import { decodeMfaChallenge, decodePasswordChangeRequired } from '@/utils/mfaUtils';

import '@/styles/04-components/auth/authForm.scss';

interface LoginValues {
  taxId: string;
  password: string;
}

const INITIAL: LoginValues = { taxId: '', password: '' };

/**
 * Formulario de login del portal de cliente: CIF/NIF + contraseña con
 * Formik y `loginSchema`. Según cómo responda `authorize()` de NextAuth,
 * completa la sesión y redirige a `/private-area`, abre {@link PortalMfaVerifyModal}
 * para un segundo factor pendiente, o redirige a `/change-password` si el
 * cliente debe fijar antes una nueva contraseña.
 * @returns {JSX.Element} El formulario de login y, si aplica, el modal de verificación 2FA
 */
export default function LoginForm() {
  const t = useTranslations('Views.Auth.Login');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const completeLogin = async () => {
    await getSession();
    const callbackUrl = searchParams.get('callbackUrl');
    const target = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/private-area';
    router.push(target as AnyHref);
  };

  const handleSubmit = async (values: LoginValues) => {
    startTransition(async () => {
      const response = await signIn('credentials', {
        taxId: values.taxId,
        password: values.password,
        redirect: false,
      });

      if (response?.ok) {
        await completeLogin();
        return;
      }

      const challenge = decodeMfaChallenge(response?.error);
      if (challenge) {
        setChallengeToken(challenge.challengeToken);
        return;
      }

      const changeToken = decodePasswordChangeRequired(response?.error);
      if (changeToken) {
        router.push({ pathname: '/change-password', query: { token: changeToken } });
        return;
      }

      setError(response?.error || null);
    });
  };

  return (
    <>
      <Formik initialValues={INITIAL} validationSchema={loginSchema} onSubmit={handleSubmit}>
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

            <Input
              id="password"
              name="password"
              type="password"
              label="password"
              placeholder="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.password}
              error={errors.password}
              required
              icon={LockIcon}
              className="input__full"
            />

            <div className="auth-form__forgot">
              <Link href="/forgot-password">{t('forgotPassword')}</Link>
            </div>

            {error && <p className="auth-form__error">{error}</p>}

            <Button
              title={isSubmitting || isPending ? 'loggingIn' : 'login'}
              type="submit"
              size="full"
              variant="primary"
              disabled={isSubmitting || isPending}
            />
          </Form>
        )}
      </Formik>

      {challengeToken && (
        <PortalMfaVerifyModal
          isOpen
          challengeToken={challengeToken}
          onClose={() => setChallengeToken(null)}
          onVerified={completeLogin}
        />
      )}
    </>
  );
}
