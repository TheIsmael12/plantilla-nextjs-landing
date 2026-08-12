'use client';

import { useMemo, useState } from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingIcon,
  CircleHelpIcon,
  DoorOpenIcon,
  DropletsIcon,
  SendIcon,
  SparklesIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { createIncident } from '@/actions/client-portal/community-incidents-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { useRouter } from '@/i18n/navigation';
import { notifyResponse } from '@/utils/toastUtils';

import Alert from '@/components/ui/alerts/Alert';
import Button from '@/components/ui/buttons/Button';
import CardRadioGroup from '@/components/ui/inputs/CardRadioGroup';
import Input from '@/components/ui/inputs/Input';
import Stepper from '@/components/ui/navigations/Stepper';
import Textarea from '@/components/ui/inputs/Textarea';

import type { LucideIcon } from 'lucide-react';
import type { IncidentPriority, PortalIncidentType } from '@/types/client-portal/community';

import '@/styles/04-components/ui/navigations/stepper.scss';
import '@/styles/04-components/client-area/incident-wizard.scss';

/*
 * Solo los tipos no sensibles del catálogo del backend. Los sensibles (`RECLAMACION`, `RUIDO`,
 * `CONVIVENCIA`) se omiten porque la API responde 400 al crearlos desde el portal: ofrecerlos sería
 * ofrecer un error seguro.
 *
 * Cada uno lleva su icono: en una rejilla de tarjetas, el dibujo es lo que se reconoce antes de leer.
 */
const INCIDENT_TYPES: { value: PortalIncidentType; icon: LucideIcon }[] = [
  { value: 'AVERIA', icon: WrenchIcon },
  { value: 'MANTENIMIENTO', icon: BuildingIcon },
  { value: 'LIMPIEZA', icon: SparklesIcon },
  { value: 'SUMINISTRO', icon: DropletsIcon },
  { value: 'ACCESO', icon: DoorOpenIcon },
  { value: 'CONSULTA', icon: CircleHelpIcon },
  { value: 'OTRO', icon: CircleHelpIcon },
];

/** Las prioridades, de menos a más: el orden en que se leen importa tanto como los nombres. */
const PRIORITIES: IncidentPriority[] = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];

/** Longitudes que impone la API; se aplican aquí para no dejar escribir lo que va a rechazar. */
const TITLE_MAX = 255;
const DESCRIPTION_MAX = 5000;
const DESCRIPTION_MIN = 10;

interface CreateIncidentWizardProps {
  services: { id: string; label: string }[];
}

/**
 * Asistente para abrir una incidencia desde el portal, a página completa.
 *
 * **Por pasos y no todo de golpe**, porque quien abre una incidencia aquí no es informático: es el
 * presidente de una comunidad diciendo que el ascensor no funciona. Antes eran cinco campos en un formulario
 * —dos de ellos desplegables con nombres del dominio— y había que entenderlos todos antes de poder enviar
 * nada. Ahora se pregunta una cosa a la vez, en el orden en que uno la cuenta: dónde, qué pasa, cuéntamelo,
 * cuánto corre, y un repaso antes de mandarlo.
 *
 * **Y en su propia página, no en un modal.** Un asistente de cinco pasos dentro de una ventana flotante
 * pelea con la pantalla: el modal tiene que crecer hasta ocupar casi todo para que quepan las tarjetas,
 * hereda su propio scroll dentro del scroll de la página, y al pulsar fuera sin querer se pierde lo escrito.
 * Con una página propia hay sitio de sobra, la dirección se puede guardar o compartir, y el botón de atrás
 * del navegador significa lo que parece.
 *
 * Tres decisiones que hacen el trabajo:
 *
 * - **El tipo son tarjetas con icono**, no un desplegable: se reconoce «Avería» por la llave inglesa antes de
 *   leerla, y se ven todas las opciones a la vez en vez de tener que abrir una lista para descubrirlas.
 * - **La prioridad se explica por lo que implica** («puede esperar», «hay que verlo hoy»), no por su nombre:
 *   «CRITICAL» no le dice nada a nadie, y si solo se ofrece el nombre todo el mundo elige la más alta.
 * - **El último paso es un repaso**, no un botón de enviar suelto. Abrir una incidencia genera trabajo para
 *   alguien y una notificación al vecino: conviene ver qué se está mandando.
 *
 * El paso de «dónde» se salta solo cuando no hay más que un sitio posible: preguntar algo que solo tiene una
 * respuesta es hacer perder el tiempo.
 * @param {CreateIncidentWizardProps} props - Servicios contratados que se pueden asociar a la incidencia
 * @returns {JSX.Element} El asistente renderizado
 */
export default function IncidentsCreateWizard({ services }: CreateIncidentWizardProps) {
  const t = useTranslations('Views.ClientArea.Communities.Incidents');
  const tWizard = useTranslations('Views.ClientArea.Communities.Incidents.Wizard');
  const tCommunities = useTranslations('Views.ClientArea.Communities');
  const tErrors = useTranslations('Common.Errors');
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const [serviceId, setServiceId] = useState('');
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('NORMAL');

  /*
   * Con un solo servicio —o ninguno— no hay nada que elegir, así que ese paso no existe.
   *
   * Y si hay uno solo, se da por elegido: la incidencia queda asociada a él sin preguntar, que es lo que
   * habría contestado cualquiera.
   */
  const hasServiceStep = services.length > 1;
  const effectiveServiceId = hasServiceStep ? serviceId : (services[0]?.id ?? '');

  const steps = useMemo(
    () => [
      ...(hasServiceStep ? [{ key: 'where', label: tWizard('stepWhere') }] : []),
      { key: 'what', label: tWizard('stepWhat') },
      { key: 'tell', label: tWizard('stepTell') },
      { key: 'urgency', label: tWizard('stepUrgency') },
      { key: 'review', label: tWizard('stepReview') },
    ],
    [hasServiceStep, tWizard],
  );

  const stepKey = steps[stepIndex]?.key ?? 'review';
  const isLastStep = stepIndex === steps.length - 1;

  /** Si el paso actual está resuelto; es lo que decide si «Siguiente» se puede pulsar. */
  const isStepComplete = (() => {
    if (stepKey === 'where') return Boolean(serviceId);
    if (stepKey === 'what') return Boolean(type);
    if (stepKey === 'tell') {
      return title.trim().length > 0 && description.trim().length >= DESCRIPTION_MIN;
    }

    return true;
  })();

  const goTo = (index: number) => {
    setStepIndex(index);
    setFurthestIndex((previous) => Math.max(previous, index));
  };

  const handleSubmit = () => {
    setIsSending(true);

    void (async () => {
      const response = await createIncident({
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
        clientServiceId: effectiveServiceId || undefined,
      });

      notifyResponse(response, tErrors('unexpectedError'));

      if (response.status === HTTPStatus.CREATED || response.status === HTTPStatus.OK) {
        /*
         * Al listado, y sin devolver el botón a «enviar»: la incidencia ya está creada, y dejar el
         * asistente operativo mientras se navega invita a un segundo envío con los mismos datos.
         */
        router.push('/private-area/incidents');
        return;
      }

      setIsSending(false);
    })();
  };

  const typeLabel = type ? t(`Type.${type}`) : '';
  const serviceLabel = services.find((service) => service.id === effectiveServiceId)?.label ?? '';

  return (
    <div className="incident-wizard">
      <Stepper steps={steps} currentIndex={stepIndex} furthestIndex={furthestIndex} onStepClick={goTo} />

      <p className="incident-wizard__question">{tWizard(`${stepKey}Question`)}</p>

      {stepKey === 'where' && (
        <CardRadioGroup
          name="incident-service"
          className="card-radio-group__grid"
          ariaLabel={tWizard('whereQuestion')}
          description={tWizard('whereHelp')}
          value={serviceId}
          onChange={setServiceId}
          options={services.map((service) => ({
            value: service.id,
            label: service.label,
            icon: BuildingIcon,
          }))}
        />
      )}

      {stepKey === 'what' && (
        <CardRadioGroup
          name="incident-type"
          className="card-radio-group__grid"
          ariaLabel={tWizard('whatQuestion')}
          description={tWizard('whatHelp')}
          value={type}
          onChange={setType}
          options={INCIDENT_TYPES.map((entry) => ({
            value: entry.value,
            label: t(`Type.${entry.value}`),
            description: tWizard(`typeHint${entry.value}`),
            icon: entry.icon,
          }))}
        />
      )}

      {stepKey === 'tell' && (
        <div className="incident-wizard__fields">
          <Input
            id="incident-title"
            name="title"
            label={t('titleField')}
            placeholder={t('titlePlaceholder')}
            noTranslate
            required
            maxLength={TITLE_MAX}
            className="input__full"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <Textarea
            id="incident-description"
            name="description"
            label={t('descriptionField')}
            placeholder={t('descriptionPlaceholder')}
            noTranslate
            required
            rows={8}
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          {/* El mínimo se dice mientras se escribe, no al intentar enviar. */}
          <p className="incident-wizard__hint">
            {description.trim().length >= DESCRIPTION_MIN
              ? tWizard('tellEnough')
              : tWizard('tellMore', { min: DESCRIPTION_MIN })}
          </p>
        </div>
      )}

      {stepKey === 'urgency' && (
        <CardRadioGroup
          name="incident-priority"
          className="card-radio-group__grid"
          ariaLabel={tWizard('urgencyQuestion')}
          description={tWizard('urgencyHelp')}
          value={priority}
          onChange={(value) => setPriority(value as IncidentPriority)}
          options={PRIORITIES.map((value) => ({
            value,
            label: tCommunities(`IncidentPriority.${value}`),
            description: tWizard(`urgencyHint${value}`),
          }))}
        />
      )}

      {stepKey === 'review' && (
        <div className="incident-wizard__review">
          <Alert type="info" message={tWizard('reviewNotice')} />

          <dl className="incident-wizard__summary">
            {serviceLabel && (
              <div>
                <dt>{t('serviceField')}</dt>
                <dd>{serviceLabel}</dd>
              </div>
            )}
            <div>
              <dt>{t('typeField')}</dt>
              <dd>{typeLabel}</dd>
            </div>
            <div>
              <dt>{t('priorityField')}</dt>
              <dd>{tCommunities(`IncidentPriority.${priority}`)}</dd>
            </div>
            <div>
              <dt>{t('titleField')}</dt>
              <dd>{title}</dd>
            </div>
            <div className="incident-wizard__summary-wide">
              <dt>{t('descriptionField')}</dt>
              <dd>{description}</dd>
            </div>
          </dl>
        </div>
      )}

      {/*
        Las flechas no son adorno: en un asistente el par de botones se lee de un vistazo por su
        dirección, no por su texto. La de «Atrás» va a la izquierda del texto y la de «Siguiente» a la
        derecha, para que cada una apunte hacia donde lleva. Mismo criterio que las altas por pasos de
        la intranet.
      */}
      <div className="incident-wizard__actions">
        {stepIndex > 0 ? (
          <Button variant="outline" title="back" onClick={() => goTo(stepIndex - 1)}>
            <ArrowLeftIcon />
          </Button>
        ) : (
          <Button
            variant="outline"
            title="cancel"
            onClick={() => router.push('/private-area/incidents')}
          >
            <XIcon />
          </Button>
        )}

        {isLastStep ? (
          <Button
            variant="primary"
            title={isSending ? 'creating' : 'createIncident'}
            iconPosition="right"
            disabled={isSending}
            onClick={handleSubmit}
          >
            {!isSending && <SendIcon />}
          </Button>
        ) : (
          <Button
            variant="primary"
            title="next"
            iconPosition="right"
            disabled={!isStepComplete}
            onClick={() => goTo(stepIndex + 1)}
          >
            <ArrowRightIcon />
          </Button>
        )}
      </div>
    </div>
  );
}
