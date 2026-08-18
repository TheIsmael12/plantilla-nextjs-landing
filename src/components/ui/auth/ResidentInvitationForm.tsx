'use client';

import { useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Form, Formik } from 'formik';
import { CheckCircle, LockIcon } from 'lucide-react';

import Input from '@/components/ui/inputs/Input';
import Button from '@/components/ui/buttons/Button';

import { acceptResidentInvitation, type ResidentInvitationPreview } from '@/actions/auth/resident-auth-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { residentAcceptInvitationSchema } from '@/schemas/auth.schema';

import '@/styles/04-components/auth/authForm.scss';

interface AcceptValues {
  newPassword: string;
  confirmPassword: string;
}

const INITIAL: AcceptValues = { newPassword: '', confirmPassword: '' };

interface ResidentInvitationFormProps {
  token: string;
  invitation: ResidentInvitationPreview;
}

/**
 * Formulario de aceptación de una invitación de vecino.
 *
 * Con `accountAlreadyExists`, no se pide contraseña: el correo ya tiene cuenta y solo hace falta confirmar la
 * pertenencia (sección 4.2 de requisitos-app-comunidad.md). Sin ello, se pediría una contraseña que el backend
 * de todas formas ignoraría, y explicar por qué sería más confuso que no pedirla.
 *
 * Tras aceptar no se guarda ninguna sesión: el backend devuelve una pensada para un dispositivo móvil, y el
 * vecino siempre entra desde la app.
 * @param {ResidentInvitationFormProps} props - Token del enlace y los datos ya previsualizados de la invitación
 * @returns {JSX.Element} El formulario renderizado
 */
export default function ResidentInvitationForm({ token, invitation }: ResidentInvitationFormProps) {
  const t = useTranslations('Views.Auth.Resident.Invitation');
  const tErrors = useTranslations('Common.Errors');
  const format = useFormatter();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: AcceptValues) => {
    setError(null);

    const response = await acceptResidentInvitation({
      token,
      password: invitation.accountAlreadyExists ? undefined : values.newPassword,
    });

    if (response.status === HTTPStatus.OK || response.status === HTTPStatus.CREATED) {
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
      validationSchema={invitation.accountAlreadyExists ? undefined : residentAcceptInvitationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
        <Form className="auth-form" noValidate>
          <div className="auth-form__header">
            <h1 className="auth-form__title">{t('title')}</h1>
            <p className="auth-form__subtitle">{t('subtitle')}</p>
          </div>

          <dl className="auth-form__summary">
            {invitation.communityName && (
              <div className="auth-form__summary-row">
                <dt>{t('community')}</dt>
                <dd>{invitation.communityName}</dd>
              </div>
            )}

            {invitation.unitCode && (
              <div className="auth-form__summary-row">
                <dt>{t('unit')}</dt>
                <dd>{invitation.unitCode}</dd>
              </div>
            )}

            {invitation.keyringNames.length > 0 && (
              <div className="auth-form__summary-row">
                <dt>{t('keyrings')}</dt>
                <dd>{invitation.keyringNames.join(', ')}</dd>
              </div>
            )}
          </dl>

          <p className="auth-form__notice">
            {t('expiresAt', { date: format.dateTime(new Date(invitation.expiresAt), { dateStyle: 'long' }) })}
          </p>

          {invitation.accountAlreadyExists ? (
            <p className="auth-form__notice">{t('existingAccountNotice')}</p>
          ) : (
            <>
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
            </>
          )}

          {error && <p className="auth-form__error">{error}</p>}

          <Button
            title={isSubmitting ? 'accepting' : invitation.accountAlreadyExists ? 'confirm' : 'accept'}
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
