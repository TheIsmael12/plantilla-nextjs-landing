'use client';

import { Form, Formik } from 'formik';
import { SendIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { createIncidentComment } from '@/actions/client-portal/community-incidents-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { useRouter } from '@/i18n/navigation';
import { createIncidentCommentSchema } from '@/schemas/incident.schema';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import Textarea from '@/components/ui/inputs/Textarea';

interface IncidentCommentValues {
  body: string;
}

const INITIAL_VALUES: IncidentCommentValues = { body: '' };

interface IncidentCommentFormProps {
  incidentId: string;
}

/**
 * Formulario para comentar en una incidencia propia.
 *
 * Es solo un textarea: un comentario del portal nace siempre con visibilidad
 * `REPORTER`, la fija el servidor, así que no hay ni debe haber un selector de
 * visibilidad.
 * @param {IncidentCommentFormProps} props - Incidencia sobre la que se comenta
 * @returns {JSX.Element} El formulario de comentario
 */
export default function IncidentCommentForm({ incidentId }: IncidentCommentFormProps) {
  const t = useTranslations('Views.ClientArea.Communities.Incidents');
  const tErrors = useTranslations('Common.Errors');
  const router = useRouter();

  const handleSubmit = async (
    values: IncidentCommentValues,
    helpers: { resetForm: () => void },
  ) => {
    const response = await createIncidentComment(incidentId, {
      body: values.body.trim(),
    });

    notifyResponse(response, tErrors('unexpectedError'));

    if (response.status === HTTPStatus.CREATED || response.status === HTTPStatus.OK) {
      helpers.resetForm();
      router.refresh();
    }
  };

  return (
    <Formik
      initialValues={INITIAL_VALUES}
      validationSchema={createIncidentCommentSchema()}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
        <Form noValidate className="incident-detail__comment-form">
          <Textarea
            id="body"
            name="body"
            label={t('commentTitle')}
            placeholder={t('commentPlaceholder')}
            noTranslate
            required
            rows={4}
            maxLength={5000}
            value={values.body}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.body}
            touched={touched.body}
          />

          <Button
            type="submit"
            variant="primary"
            title={isSubmitting ? 'sending' : 'send'}
            disabled={isSubmitting}
          >
            <SendIcon aria-hidden="true" />
          </Button>
        </Form>
      )}
    </Formik>
  );
}
