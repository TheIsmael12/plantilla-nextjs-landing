'use client';

import { useMemo, useRef, useState } from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgeHelpIcon,
  BriefcaseIcon,
  ClockIcon,
  EyeOffIcon,
  GavelIcon,
  InfoIcon,
  LightbulbIcon,
  MapPinIcon,
  SendIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { submitComplaint } from '@/actions/complaints/complaints-actions';
import { Link, useRouter } from '@/i18n/navigation';
import { HONEYPOT_FIELD_NAME, PRIVACY_NOTICE_VERSION } from '@/config/settings';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Alert from '@/components/ui/alerts/Alert';
import Button from '@/components/ui/buttons/Button';
import CardRadioGroup from '@/components/ui/inputs/CardRadioGroup';
import Captcha from '@/components/ui/inputs/Captcha';
import DatePicker from '@/components/ui/inputs/DatePicker';
import Input from '@/components/ui/inputs/Input';
import Stepper from '@/components/ui/navigations/Stepper';
import Textarea from '@/components/ui/inputs/Textarea';

import { formatShortDate, toLocalIsoDate } from '@/utils/dateUtils';

import '@/styles/04-components/ui/navigations/stepper.scss';
import '@/styles/04-components/help/complaintWizard.scss';

/** Longitudes que impone el backend; se aplican aquí para no dejar escribir lo que va a rechazar. */
const DESCRIPTION_MAX = 5000;
const DESCRIPTION_MIN = 20;

/**
 * Asistente para presentar una reclamación, a página completa — mismo criterio que
 * `IncidentsCreateWizard.tsx` (portal de cliente): por pasos y no todo de golpe, porque quien
 * llega aquí puede estar reportando algo delicado y un formulario largo con un desplegable, dos
 * bloques condicionales y un checkbox de anonimato de golpe es intimidante. Se pregunta una cosa
 * a la vez, en el orden en que uno lo cuenta: qué tipo de reclamación es, qué ha pasado
 * (`details`), en qué contexto (`context`: localidad y si trabaja en Imora, ambos opcionales),
 * si quiere identificarse, cómo contactar (si procede), y un repaso antes de enviar. `details` y
 * `context` estaban fusionados en un único paso al añadir los campos de Ilunion
 * (localidad/relación laboral): se separaron porque mezclaban tres tipos de control distintos
 * (texto largo, input corto, tarjetas de radio) en la misma pantalla, rompiendo el criterio de
 * "un tipo de pregunta por paso" que sigue el resto del asistente.
 *
 * El paso "contacto" se salta solo si se marcó anonimato: preguntar un dato que ya se dijo que
 * no se va a dar es hacer perder el tiempo (mismo criterio que el paso "dónde" en incidencias,
 * que se salta con un solo servicio posible).
 *
 * Antes del primer paso hay una pantalla de introducción (`hasStarted === false`): la petición
 * original era que esto "no parezca un wizard bien explicado y demás" sin más contexto —
 * llegar directo a "Tipo · Detalles · Identificación..." sin explicar antes qué es esto ni
 * enlazar a la información legal completa (`/complaints-channel`) deja al usuario sin marco
 * antes de empezar a rellenar. La intro no es un paso más del `Stepper` (no cuenta para su
 * progreso), es una pantalla previa con un único CTA "Empezar".
 *
 * Ni la intro ni el wizard van dentro de una tarjeta con borde/fondo: viven directamente sobre
 * el fondo de la página (`complaintWizard.scss`), con el mismo peso tipográfico de pregunta y
 * las mismas acciones ancladas al pie en ambos estados, para que pasar de uno a otro no se
 * sienta como dos pantallas de sitios distintos — sin necesitar una caja visual para lograrlo.
 * @returns {JSX.Element} El asistente renderizado
 */
export default function ComplaintsCreateWizard() {
  const t = useTranslations('Complaints.wizard');
  const tErrors = useTranslations('Common.Errors');
  const locale = useLocale();
  const router = useRouter();
  const captchaTokenRef = useRef<string | undefined>(undefined);

  const [hasStarted, setHasStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [type, setType] = useState<'SERVICE_QUALITY' | 'ETHICS_COMPLIANCE' | ''>('');
  const [affectedCommunityName, setAffectedCommunityName] = useState('');
  const [serviceDate, setServiceDate] = useState<Date | null>(null);
  const [serviceDescription, setServiceDescription] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  // Tres respuestas posibles y explícitas ("no", "sí", "prefiero no decirlo") más un cuarto
  // estado real de "nada tocado todavía" (`null`): un boolean no puede distinguir "no trabajo
  // aquí" de "no he contestado", y arrancar con una tarjeta ya marcada sin que el usuario haya
  // hecho nada se lee como una respuesta dada, no como una pregunta pendiente.
  const [reporterIsEmployee, setReporterIsEmployee] = useState<'yes' | 'no' | 'unset' | null>(null);
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [privacyNoticeAcknowledged, setPrivacyNoticeAcknowledged] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const isServiceQuality = type === 'SERVICE_QUALITY';

  // El paso de contacto no existe si ya se decidió el anonimato: preguntar nombre/email a quien
  // acaba de decir que prefiere no identificarse es la misma pérdida de tiempo que el paso
  // "dónde" de incidencias cuando solo hay un servicio posible.
  const hasContactStep = isAnonymous === false;

  const steps = useMemo(
    () => [
      { key: 'type', label: t('stepType') },
      { key: 'details', label: t('stepDetails') },
      { key: 'context', label: t('stepContext') },
      { key: 'anonymous', label: t('stepAnonymous') },
      ...(hasContactStep ? [{ key: 'contact', label: t('stepContact') }] : []),
      { key: 'review', label: t('stepReview') },
    ],
    [hasContactStep, t],
  );

  const stepKey = steps[stepIndex]?.key ?? 'review';
  const isLastStep = stepIndex === steps.length - 1;

  /** Si el paso actual está resuelto; es lo que decide si «Siguiente» se puede pulsar. */
  const isStepComplete = (() => {
    if (stepKey === 'type') return Boolean(type);
    if (stepKey === 'details') {
      const hasServiceFields = !isServiceQuality
        || (affectedCommunityName.trim().length > 0 && Boolean(serviceDate) && serviceDescription.trim().length > 0);
      return hasServiceFields && description.trim().length >= DESCRIPTION_MIN;
    }
    // El paso de contexto es enteramente opcional (localidad y relación con la empresa no son
    // obligatorias): siempre se puede avanzar desde aquí.
    if (stepKey === 'context') return true;
    if (stepKey === 'anonymous') return isAnonymous !== null;
    if (stepKey === 'contact') {
      return contactName.trim().length > 0 && contactEmail.trim().length > 0;
    }
    if (stepKey === 'review') return privacyNoticeAcknowledged;

    return true;
  })();

  const goTo = (index: number) => {
    // Si se vuelve a "anonimato" y se cambia la respuesta, el paso "contacto" puede
    // aparecer/desaparecer y desplazar los índices — se recalcula el destino tras el cambio en
    // vez de dejar `furthestIndex` apuntando a un paso que ya no es el que se quería.
    setStepIndex(index);
    setFurthestIndex((previous) => Math.max(previous, index));
  };

  const handleAnonymousChange = (value: boolean) => {
    setIsAnonymous(value);
    if (value) {
      setContactName('');
      setContactEmail('');
    }
  };

  const handleSubmit = () => {
    setIsSending(true);

    void (async () => {
      const response = await submitComplaint({
        type: type as 'SERVICE_QUALITY' | 'ETHICS_COMPLIANCE',
        affectedCommunityName: isServiceQuality ? affectedCommunityName.trim() : undefined,
        serviceDate: isServiceQuality && serviceDate ? toLocalIsoDate(serviceDate) : undefined,
        serviceDescription: isServiceQuality ? serviceDescription.trim() : undefined,
        incidentLocation: incidentLocation.trim() || undefined,
        // "unset" (prefiero no decirlo) y "nada tocado" viajan igual: el backend solo entiende
        // true/false/ausente, no una tercera opción explícita de "prefiero no decirlo".
        reporterIsEmployee:
          reporterIsEmployee === 'yes' ? true : reporterIsEmployee === 'no' ? false : undefined,
        description: description.trim(),
        isAnonymous: isAnonymous ?? false,
        contactName: isAnonymous ? undefined : contactName.trim() || undefined,
        contactEmail: isAnonymous ? undefined : contactEmail.trim() || undefined,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        privacyNoticeAcknowledged,
        captchaToken: captchaTokenRef.current,
        honeypot: honeypot || undefined,
      });

      notifyResponse(response, tErrors('unexpectedError'));

      if (response.status === HTTPStatus.CREATED || response.status === HTTPStatus.OK) {
        setIsSent(true);
        return;
      }

      setIsSending(false);
    })();
  };

  if (isSent) {
    return (
      <div className="complaint-wizard complaint-wizard--sent">
        <Alert type="success" message={t('sentMessage')} />
      </div>
    );
  }

  if (!hasStarted) {
    const introPoints = [
      { key: 'confidential', icon: ShieldCheckIcon, text: t('introPointConfidential') },
      { key: 'anonymous', icon: EyeOffIcon, text: t('introPointAnonymous') },
      { key: 'noRetaliation', icon: UserCheckIcon, text: t('introPointNoRetaliation') },
    ];

    return (
      <div className="complaint-wizard-intro">
        <div>
          <h2 className="complaint-wizard-intro__title">{t('introTitle')}</h2>
          <p className="complaint-wizard-intro__text">{t('introText')}</p>
        </div>

        <ul className="complaint-wizard-intro__points">
          {introPoints.map(({ key, icon: Icon, text }) => (
            <li key={key}>
              <Icon size={18} aria-hidden="true" />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="complaint-wizard__note">
          <InfoIcon aria-hidden="true" />
          <div>
            <p className="complaint-wizard__note-title">{t('introScopeTitle')}</p>
            <p className="complaint-wizard__note-text">{t('introScopeText')}</p>
          </div>
        </div>

        <div className="complaint-wizard__actions complaint-wizard-intro__actions">
          <Link href="/complaints-channel" className="complaint-wizard-intro__link">
            {t('introLearnMore')}
          </Link>
          <Button
            variant="primary"
            title="startComplaint"
            iconPosition="right"
            onClick={() => setHasStarted(true)}
          >
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    );
  }

  const typeLabel = type ? t(`typeOptions.${type === 'SERVICE_QUALITY' ? 'serviceQuality' : 'ethicsCompliance'}`) : '';

  return (
    <div className="complaint-wizard">
      <Stepper steps={steps} currentIndex={stepIndex} furthestIndex={furthestIndex} onStepClick={goTo} />

      <p className="complaint-wizard__question">{t(`${stepKey}Question`)}</p>

      {stepKey === 'type' && (
        <CardRadioGroup
          name="complaint-type"
          className="card-radio-group__grid"
          ariaLabel={t('typeQuestion')}
          description={t('typeHelp')}
          value={type}
          onChange={(value) => setType(value as 'SERVICE_QUALITY' | 'ETHICS_COMPLIANCE')}
          options={[
            {
              value: 'SERVICE_QUALITY',
              label: t('typeOptions.serviceQuality'),
              description: t('typeHintServiceQuality'),
              icon: WrenchIcon,
            },
            {
              value: 'ETHICS_COMPLIANCE',
              label: t('typeOptions.ethicsCompliance'),
              description: t('typeHintEthicsCompliance'),
              icon: GavelIcon,
            },
          ]}
        />
      )}

      {stepKey === 'details' && (
        <div className="complaint-wizard__fields">
          {isServiceQuality && (
            <>
              <div className="complaint-wizard__fields-row">
                <Input
                  id="complaint-community"
                  name="affectedCommunityName"
                  label={t('fields.affectedCommunityName')}
                  placeholder={t('placeholders.affectedCommunityName')}
                  noTranslate
                  required
                  className="input__full"
                  value={affectedCommunityName}
                  onChange={(event) => setAffectedCommunityName(event.target.value)}
                />

                <DatePicker
                  id="complaint-service-date"
                  name="serviceDate"
                  label={t('fields.serviceDate')}
                  required
                  disableFuture
                  clearable
                  className="date-picker__full"
                  value={serviceDate}
                  onChange={setServiceDate}
                />
              </div>

              <Textarea
                id="complaint-service-description"
                name="serviceDescription"
                label={t('fields.serviceDescription')}
                placeholder={t('placeholders.serviceDescription')}
                noTranslate
                required
                rows={3}
                value={serviceDescription}
                onChange={(event) => setServiceDescription(event.target.value)}
              />
            </>
          )}

          <Textarea
            id="complaint-description"
            name="description"
            label={t('fields.description')}
            placeholder={t('placeholders.description')}
            noTranslate
            required
            rows={8}
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <p className="complaint-wizard__hint">
            {description.trim().length >= DESCRIPTION_MIN
              ? t('detailsEnough')
              : t('detailsMore', { min: DESCRIPTION_MIN })}
          </p>

          <div className="complaint-wizard__note">
            <LightbulbIcon aria-hidden="true" />
            <div>
              <p className="complaint-wizard__note-title">{t('detailsNoteTitle')}</p>
              <ul className="complaint-wizard__note-list">
                <li>{t('detailsNoteWhen')}</li>
                <li>{t('detailsNoteWho')}</li>
                <li>{t('detailsNoteWitnesses')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {stepKey === 'context' && (
        <div className="complaint-wizard__fields">
          <div>
            <Input
              id="complaint-location"
              name="incidentLocation"
              label={t('fields.incidentLocation')}
              placeholder={t('placeholders.incidentLocation')}
              noTranslate
              icon={MapPinIcon}
              className="input__full"
              value={incidentLocation}
              onChange={(event) => setIncidentLocation(event.target.value)}
            />
            <p className="complaint-wizard__hint complaint-wizard__hint--tight">{t('incidentLocationHint')}</p>
          </div>

          <CardRadioGroup
            name="complaint-reporter-employee"
            className="card-radio-group__row"
            label={t('reporterEmployeeQuestion')}
            description={t('reporterEmployeeHelp')}
            value={reporterIsEmployee ?? ''}
            onChange={(value) => setReporterIsEmployee(value as 'yes' | 'no' | 'unset')}
            options={[
              { value: 'no', label: t('reporterEmployeeOptions.no'), icon: UserCheckIcon },
              { value: 'yes', label: t('reporterEmployeeOptions.yes'), icon: BriefcaseIcon },
              { value: 'unset', label: t('reporterEmployeeOptions.preferNotToSay'), icon: BadgeHelpIcon },
            ]}
          />
        </div>
      )}

      {stepKey === 'anonymous' && (
        <div className="complaint-wizard__fields">
          <CardRadioGroup
            name="complaint-anonymous"
            className="card-radio-group__grid"
            ariaLabel={t('anonymousQuestion')}
            description={t('anonymousHelp')}
            value={isAnonymous === null ? '' : isAnonymous ? 'yes' : 'no'}
            onChange={(value) => handleAnonymousChange(value === 'yes')}
            options={[
              {
                value: 'no',
                label: t('anonymousOptions.identified'),
                description: t('anonymousHintIdentified'),
                icon: UserCheckIcon,
              },
              {
                value: 'yes',
                label: t('anonymousOptions.anonymous'),
                description: t('anonymousHintAnonymous'),
                icon: EyeOffIcon,
              },
            ]}
          />

          {isAnonymous !== null && (
            <Alert
              type={isAnonymous ? 'warning' : 'info'}
              message={isAnonymous ? t('anonymousConsequenceAnonymous') : t('anonymousConsequenceIdentified')}
            />
          )}
        </div>
      )}

      {stepKey === 'contact' && (
        <div className="complaint-wizard__fields">
          <Input
            id="complaint-contact-name"
            name="contactName"
            label={t('fields.contactName')}
            placeholder={t('placeholders.contactName')}
            noTranslate
            required
            autoComplete="name"
            className="input__full"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
          />

          <Input
            id="complaint-contact-email"
            name="contactEmail"
            label={t('fields.contactEmail')}
            type="email"
            placeholder={t('placeholders.contactEmail')}
            noTranslate
            required
            autoComplete="email"
            className="input__full"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
          />
        </div>
      )}

      {stepKey === 'review' && (
        <div className="complaint-wizard__review">
          <Alert type="info" message={t('reviewNotice')} />

          <div className="complaint-wizard__note">
            <ClockIcon aria-hidden="true" />
            <div>
              <p className="complaint-wizard__note-title">{t('reviewNextStepsTitle')}</p>
              <p className="complaint-wizard__note-text">{t('reviewNextStepsText')}</p>
            </div>
          </div>

          <dl className="complaint-wizard__summary">
            <div>
              <dt>{t('fields.type')}</dt>
              <dd>{typeLabel}</dd>
            </div>
            {isServiceQuality && (
              <>
                <div>
                  <dt>{t('fields.affectedCommunityName')}</dt>
                  <dd>{affectedCommunityName}</dd>
                </div>
                <div>
                  <dt>{t('fields.serviceDate')}</dt>
                  <dd>{serviceDate ? formatShortDate(serviceDate, locale) : ''}</dd>
                </div>
              </>
            )}
            <div>
              <dt>{t('anonymousOptions.identified')}</dt>
              <dd>{isAnonymous ? t('anonymousOptions.anonymous') : (contactName || t('fields.contactName'))}</dd>
            </div>
            <div className="complaint-wizard__summary-wide">
              <dt>{t('fields.description')}</dt>
              <dd>{description}</dd>
            </div>
          </dl>

          {/* Campo trampa: oculto visualmente y fuera del flujo de tabulación, pero presente en
              el DOM para que los bots que rellenan todos los campos automáticamente caigan en él. */}
          <div className="complaint-wizard__honeypot" aria-hidden="true">
            <label htmlFor="complaint-website">Website</label>
            <input
              id="complaint-website"
              name={HONEYPOT_FIELD_NAME}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>

          <div className="complaint-wizard__consent">
            <input
              id="complaint-privacy"
              type="checkbox"
              className="complaint-wizard__checkbox"
              checked={privacyNoticeAcknowledged}
              onChange={(event) => setPrivacyNoticeAcknowledged(event.target.checked)}
              aria-label={t('consents.privacyLabel')}
            />
            <label htmlFor="complaint-privacy" className="complaint-wizard__consent-text">
              {t('consents.privacyLabel')}
            </label>
          </div>

          <Captcha
            onVerify={(token) => {
              captchaTokenRef.current = token;
            }}
            onExpire={() => {
              captchaTokenRef.current = undefined;
            }}
          />
        </div>
      )}

      {/* Las flechas no son adorno: en un asistente el par de botones se lee de un vistazo por
          su dirección, no por su texto — mismo criterio que IncidentsCreateWizard. */}
      <div className="complaint-wizard__actions">
        {stepIndex > 0 ? (
          <Button variant="outline" title="back" onClick={() => goTo(stepIndex - 1)}>
            <ArrowLeftIcon />
          </Button>
        ) : (
          <Button variant="outline" title="cancel" onClick={() => router.push('/help')}>
            <XIcon />
          </Button>
        )}

        {isLastStep ? (
          <Button
            variant="primary"
            title={isSending ? 'submittingComplaint' : 'submitComplaint'}
            iconPosition="right"
            disabled={isSending || !isStepComplete}
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
