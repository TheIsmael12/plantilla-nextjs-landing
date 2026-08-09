'use client';

import { useState } from 'react';

import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { createIncident } from '@/actions/client-portal/community-incidents-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { useRouter } from '@/i18n/navigation';
import { createIncidentSchema } from '@/schemas/incident.schema';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import Input from '@/components/ui/inputs/Input';
import Select from '@/components/ui/inputs/Select';
import Textarea from '@/components/ui/inputs/Textarea';
import ModalComponent from '@/components/ui/modals/ModalComponent';

import type { IncidentPriority, PortalIncidentType } from '@/types/client-portal/community';

/*
 * Solo los tipos no sensibles del catálogo del backend. Los sensibles
 * (`RECLAMACION`, `RUIDO`, `CONVIVENCIA`) se omiten porque la API responde 400
 * al crearlos desde el portal: ofrecerlos sería ofrecer un error seguro.
 */
const INCIDENT_TYPES: PortalIncidentType[] = [
  'AVERIA',
  'MANTENIMIENTO',
  'LIMPIEZA',
  'SUMINISTRO',
  'ACCESO',
  'CONSULTA',
  'OTRO',
];

const PRIORITIES: IncidentPriority[] = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];

interface CreateIncidentValues {
  title: string;
  description: string;
  type: string;
  priority: string;
  clientServiceId: string;
}

const INITIAL_VALUES: CreateIncidentValues = {
  title: '',
  description: '',
  type: '',
  priority: 'NORMAL',
  clientServiceId: '',
};

interface CreateIncidentModalProps {
  services: { id: string; label: string }[];
}

/**
 * Botón y modal para abrir una incidencia desde el portal.
 *
 * No hay ningún control de sensibilidad ni de estado: el cliente solo crea y
 * comenta, y que una incidencia sea sensible lo decide el backend a partir del
 * tipo, sin que el concepto llegue a asomar en la interfaz.
 * @param {CreateIncidentModalProps} props - Servicios contratados que se pueden asociar a la incidencia
 * @returns {JSX.Element} El botón con su modal de creación
 */
export default function CreateIncidentModal({ services }: CreateIncidentModalProps) {
  const t = useTranslations('Views.ClientArea.Communities.Incidents');
  const tCommunities = useTranslations('Views.ClientArea.Communities');
  const tErrors = useTranslations('Common.Errors');
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (values: CreateIncidentValues) => {
    const response = await createIncident({
      title: values.title.trim(),
      description: values.description.trim(),
      type: values.type,
      priority: (values.priority || undefined) as IncidentPriority | undefined,
      clientServiceId: values.clientServiceId || undefined,
    });

    notifyResponse(response, tErrors('unexpectedError'));

    if (response.status === HTTPStatus.CREATED || response.status === HTTPStatus.OK) {
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <Button variant="primary" title="create" onClick={() => setIsOpen(true)}>
        <PlusIcon aria-hidden="true" />
      </Button>

      <ModalComponent<CreateIncidentValues>
        title={t('createTitle')}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialValues={INITIAL_VALUES}
        validationSchema={createIncidentSchema()}
        onSubmit={handleSubmit}
        submitText="create"
        submittingText="creating"
        isLarge
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <>
            <Input
              id="title"
              name="title"
              label={t('titleField')}
              placeholder={t('titlePlaceholder')}
              noTranslate
              required
              maxLength={255}
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.title}
              touched={touched.title}
            />

            <Textarea
              id="description"
              name="description"
              label={t('descriptionField')}
              placeholder={t('descriptionPlaceholder')}
              noTranslate
              required
              rows={5}
              maxLength={5000}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.description}
              touched={touched.description}
            />

            <Select
              id="type"
              name="type"
              label={t('typeField')}
              noTranslate
              required
              options={INCIDENT_TYPES.map((type) => ({
                value: type,
                label: t(`Type.${type}`),
              }))}
              value={values.type}
              onChange={(value) => setFieldValue('type', value)}
              error={errors.type}
              touched={touched.type}
            />

            <Select
              id="priority"
              name="priority"
              label={t('priorityField')}
              noTranslate
              options={PRIORITIES.map((priority) => ({
                value: priority,
                label: tCommunities(`IncidentPriority.${priority}`),
              }))}
              value={values.priority}
              onChange={(value) => setFieldValue('priority', value)}
            />

            {services.length > 0 && (
              <Select
                id="clientServiceId"
                name="clientServiceId"
                label={t('serviceField')}
                noTranslate
                options={[
                  { value: '', label: t('serviceNone') },
                  ...services.map((service) => ({
                    value: service.id,
                    label: service.label,
                  })),
                ]}
                value={values.clientServiceId}
                onChange={(value) => setFieldValue('clientServiceId', value)}
              />
            )}
          </>
        )}
      </ModalComponent>
    </>
  );
}
