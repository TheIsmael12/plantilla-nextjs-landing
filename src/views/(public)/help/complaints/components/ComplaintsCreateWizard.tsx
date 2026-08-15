'use client';

import { useMemo, useRef, useState } from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeOffIcon,
  GavelIcon,
  SendIcon,
  UserCheckIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { submitComplaint } from '@/actions/complaints/complaints-actions';
import { useRouter } from '@/i18n/navigation';
import { HONEYPOT_FIELD_NAME, PRIVACY_NOTICE_VERSION } from '@/config/settings';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Alert from '@/components/ui/alerts/Alert';
import Button from '@/components/ui/buttons/Button';
import CardRadioGroup from '@/components/ui/inputs/CardRadioGroup';
import Captcha from '@/components/ui/inputs/Captcha';
import Input from '@/components/ui/inputs/Input';
import Stepper from '@/components/ui/navigations/Stepper';
import Textarea from '@/components/ui/inputs/Textarea';

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
 * a la vez, en el orden en que uno lo cuenta: qué tipo de reclamación es, qué ha pasado, si
 * quiere identificarse, cómo contactar (si procede), y un repaso antes de enviar.
 *
 * El paso "contacto" se salta solo si se marcó anonimato: preguntar un dato que ya se dijo que
 * no se va a dar es hacer perder el tiempo (mismo criterio que el paso "dónde" en incidencias,
 * que se salta con un solo servicio posible).
 * @returns {JSX.Element} El asistente renderizado
 */
export default function ComplaintsCreateWizard() {
  const t = useTranslations('Complaints.wizard');
  const tErrors = useTranslations('Common.Errors');
  const router = useRouter();
  const captchaTokenRef = useRef<string | undefined>(undefined);

  const [stepIndex, setStepIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [type, setType] = useState<'SERVICE_QUALITY' | 'ETHICS_COMPLIANCE' | ''>('');
  const [affectedCommunityName, setAffectedCommunityName] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
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
        serviceDate: isServiceQuality ? serviceDate : undefined,
        serviceDescription: isServiceQuality ? serviceDescription.trim() : undefined,
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

              <Input
                id="complaint-service-date"
                name="serviceDate"
                label={t('fields.serviceDate')}
                type="date"
                noTranslate
                required
                className="input__full"
                value={serviceDate}
                onChange={(event) => setServiceDate(event.target.value)}
              />

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
        </div>
      )}

      {stepKey === 'anonymous' && (
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
                  <dd>{serviceDate}</dd>
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
