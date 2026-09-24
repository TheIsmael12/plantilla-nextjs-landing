'use client';

import { useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Form, Formik } from 'formik';
import { CheckCircle, LockIcon, MailIcon, PhoneIcon, UserIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import Input from '@/components/ui/inputs/Input';
import Button from '@/components/ui/buttons/Button';

import { acceptResidentInvitation, type ResidentInvitationPreview } from '@/actions/auth/resident-auth-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import {
  residentAcceptInvitationNewAccountSchema,
  residentAcceptInvitationSchema,
} from '@/schemas/auth.schema';

import '@/styles/04-components/auth/authForm.scss';

interface AcceptValues {
  name: string;
  phone: string;
  newPassword: string;
  confirmPassword: string;
  privacyNoticeAccepted: boolean;
}

const INITIAL: AcceptValues = {
  name: '',
  phone: '',
  newPassword: '',
  confirmPassword: '',
  privacyNoticeAccepted: false,
};

interface ResidentInvitationFormProps {
  token: string;
  invitation: ResidentInvitationPreview;
}

/**
 * Formulario de aceptación de una invitación de vecino.
 *
 * Tres casos, según lo que ya se sabe de la persona (sección 4.2 de requisitos-app-comunidad.md):
 *
 * - **Ya puede entrar** (`hasIdentity`): no se pide nada, solo confirmar. Es quien acepta una segunda
 *   invitación —otra comunidad, otra unidad— teniendo ya cuenta activa.
 * - **Existe pero sin forma de entrar** (`accountAlreadyExists && !hasIdentity`): es el vecino dado de alta a
 *   mano desde la intranet. Sus datos ya los puso el administrador, así que **no se piden ni se pueden
 *   tocar aquí**: solo se pide la contraseña con la que va a entrar.
 * - **Cuenta nueva** (`!accountAlreadyExists`): nadie ha escrito nada de esta persona todavía, así que se
 *   piden sus datos igual que el alta directa desde la intranet, **sin unidad** —esa la fija la invitación,
 *   no se elige aquí— más la contraseña.
 *
 * Tras aceptar no se guarda ninguna sesión: el backend devuelve una pensada para un dispositivo móvil, y el
 * vecino siempre entra desde la app.
 * @param {ResidentInvitationFormProps} props - Token del enlace y los datos ya previsualizados de la invitación
 * @returns {JSX.Element} El formulario renderizado
 */
export default function ResidentInvitationForm({ token, invitation }: ResidentInvitationFormProps) {
  const t = useTranslations('Views.Auth.Resident.Invitation');
  const tErrors = useTranslations('Common.Errors');
  const tValidations = useTranslations('Validations');
  const format = useFormatter();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isNewAccount = !invitation.accountAlreadyExists;
  const needsPassword = !invitation.hasIdentity;

  const handleSubmit = async (values: AcceptValues) => {
    setError(null);

    const response = await acceptResidentInvitation({
      token,
      password: needsPassword ? values.newPassword : undefined,
      name: isNewAccount ? values.name.trim() : undefined,
      phone: isNewAccount ? values.phone.trim() || undefined : undefined,
      // Prueba de consentimiento: solo se manda cuando se fija la forma de entrar (mismo caso en que se pide).
      privacyNoticeAccepted: needsPassword ? values.privacyNoticeAccepted : undefined,
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

  const initialValues: AcceptValues = {
    ...INITIAL,
    name: invitation.name ?? '',
    phone: invitation.phone ?? '',
  };

  const validationSchema = !needsPassword
    ? undefined
    : isNewAccount
      ? residentAcceptInvitationNewAccountSchema
      : residentAcceptInvitationSchema;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
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

          <Input
            id="email"
            name="email"
            type="email"
            label="email"
            value={invitation.email}
            onChange={() => {}}
            disabled
            icon={MailIcon}
            className="input__full"
          />

          {/*
            Cuenta ya existente sin forma de entrar: sus datos los puso el administrador al darlo de alta
            (sección 2.1) y aquí solo se enseñan, no se editan. Pedirlos de nuevo sería dejar que el vecino
            pise lo que ya escribió quien lo invitó.
          */}
          {!isNewAccount && (
            <>
              <Input
                id="name"
                name="name"
                label="name"
                value={invitation.name ?? ''}
                onChange={() => {}}
                disabled
                icon={UserIcon}
                className="input__full"
              />

              {invitation.phone && (
                <Input
                  id="phone"
                  name="phone"
                  label="phone"
                  value={invitation.phone}
                  onChange={() => {}}
                  disabled
                  icon={PhoneIcon}
                  className="input__full"
                />
              )}
            </>
          )}

          {/*
            Cuenta nueva: nadie ha escrito nada de esta persona todavía, así que se piden sus datos igual que
            el alta directa desde la intranet, pero **sin unidad**: esa la fija la invitación y no se elige
            aquí, a diferencia del formulario de la intranet.
          */}
          {isNewAccount && (
            <>
              <Input
                id="name"
                name="name"
                label="name"
                placeholder="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.name}
                error={errors.name}
                required
                icon={UserIcon}
                className="input__full"
              />

              <Input
                id="phone"
                name="phone"
                label="phone"
                placeholder="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.phone}
                error={errors.phone}
                icon={PhoneIcon}
                className="input__full"
              />
            </>
          )}

          {!needsPassword ? (
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

              {/*
                Aviso de privacidad (art. 13 RGPD): obligatorio para completar el alta. El enlace lleva a
                la política de privacidad. Sin marcarlo, el esquema (`residentAcceptInvitation*Schema`)
                bloquea el envío.
              */}
              <div className="auth-form__consent">
                <input
                  id="privacyNoticeAccepted"
                  name="privacyNoticeAccepted"
                  type="checkbox"
                  className="auth-form__consent-checkbox"
                  checked={values.privacyNoticeAccepted}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-label={t('privacyLabel')}
                />
                <label htmlFor="privacyNoticeAccepted" className="auth-form__consent-text">
                  {t('privacyLabel')}{' '}
                  <Link href="/privacy-policy">{t('privacyLink')}</Link> *
                </label>
              </div>
              {errors.privacyNoticeAccepted && touched.privacyNoticeAccepted && (
                <p className="auth-form__error">* {tValidations(errors.privacyNoticeAccepted)}</p>
              )}
            </>
          )}

          {error && <p className="auth-form__error">{error}</p>}

          <Button
            title={isSubmitting ? 'accepting' : !needsPassword ? 'confirm' : 'accept'}
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
