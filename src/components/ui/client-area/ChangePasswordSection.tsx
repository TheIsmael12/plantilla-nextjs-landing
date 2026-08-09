'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { LockIcon, SaveIcon } from 'lucide-react';

import { changeClientPortalPassword } from '@/actions/auth/client-portal-auth-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { changePasswordSchema } from '@/schemas/auth.schema';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import Input from '@/components/ui/inputs/Input';
import SettingsSection from '@/components/ui/sections/SettingsSection';

import '@/styles/04-components/client-area/profile-security.scss';

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_VALUES: ChangePasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

/**
 * Sección de cambio de contraseña de `/profile/security` (autoservicio,
 * distinta del cambio obligatorio tras login): pide la contraseña actual
 * además de la nueva. Mismo patrón que `ProfileChangePasswordSection` de
 * intranet.
 * @returns {JSX.Element} La sección de cambio de contraseña renderizada
 */
export default function ChangePasswordSection() {
  const t = useTranslations('Views.ClientArea.Profile.Password');
  const tErrors = useTranslations('Common.Errors');

  const handleSubmit = async (
    values: ChangePasswordValues,
    helpers: { resetForm: () => void },
  ) => {
    const response = await changeClientPortalPassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });

    notifyResponse(response, tErrors('unexpectedError'));

    if (response.status === HTTPStatus.OK) {
      helpers.resetForm();
    }
  };

  return (
    <SettingsSection title={t('title')} description={t('description')} icon={LockIcon}>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={changePasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form noValidate className="profile-change-password-section__form">
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              label="currentPassword"
              placeholder="currentPassword"
              autoComplete="current-password"
              value={values.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.currentPassword}
              error={errors.currentPassword}
              required
              disabled={isSubmitting}
              icon={LockIcon}
              className="input__md"
            />

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
              disabled={isSubmitting}
              icon={LockIcon}
              className="input__md"
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
              disabled={isSubmitting}
              icon={LockIcon}
              className="input__md"
            />

            <Button
              title={isSubmitting ? 'submitting' : 'submit'}
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              <SaveIcon />
            </Button>
          </Form>
        )}
      </Formik>
    </SettingsSection>
  );
}
