'use client';

import { useRef, useState } from 'react';

import { useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle, FileTextIcon, SendIcon, XIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import Button from '@/components/ui/buttons/Button';
import Captcha from '@/components/ui/inputs/Captcha';
import Input from '@/components/ui/inputs/Input';
import Select from '@/components/ui/inputs/Select';
import Textarea from '@/components/ui/inputs/Textarea';
import Stepper from '@/components/ui/navigations/Stepper';

import { HONEYPOT_FIELD_NAME } from '@/config/settings';

import { jobApplicationSchema } from '@/schemas/careers.schema';

import '@/styles/04-components/ui/forms/form-row.scss';

import '@/styles/04-components/careers/careersForm.scss';

const INITIAL: JobApplicationFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    citySlug: '',
    coverLetter: '',
    linkedinUrl: '',
    cv: null,
    privacyNoticeAcknowledged: false,
    talentPoolConsent: false,
    honeypot: '',
};

/**
 * Qué campos valida cada paso antes de dejar avanzar.
 *
 * Sin esto el asistente sería decorado: se podría llegar al último paso con el correo mal escrito y
 * enterarse al final, que es peor que un formulario largo de una sola pantalla.
 */
const STEP_FIELDS: (keyof JobApplicationFormValues)[][] = [
    ['firstName', 'lastName', 'email', 'phone', 'citySlug'],
    ['cv', 'coverLetter', 'linkedinUrl'],
    ['privacyNoticeAcknowledged'],
];

/**
 * Formulario de candidatura, en tres pasos (requisitos-empleo.md, sección 4.2).
 *
 * Lo que **no** pide es tan importante como lo que pide: no hay fotografía, ni fecha de nacimiento, ni
 * nacionalidad, ni sexo, ni DNI. No están ni como campo opcional, y se dice en el propio formulario: un dato
 * que no está no puede influir en la decisión.
 *
 * Va por pasos porque son nueve campos y un fichero: en una sola pantalla, en un móvil, la barra de
 * desplazamiento asusta más que el formulario en sí. Cada paso valida lo suyo antes de dejar avanzar, así
 * que un correo mal escrito se ve en el paso uno y no al final.
 *
 * El CV se comprueba en el navegador antes de subir —solo PDF, hasta 5 MB— porque dejar que se suban 20 MB
 * para que el servidor los rechace es gastar la conexión de quien se presenta, que muchas veces está en el
 * móvil. El mensaje de error dice **qué hacer**, no qué ha pasado.
 *
 * Es presentacional, igual que {@link ContactForm} y con el mismo contrato: valida con Formik + Yup
 * (`jobApplicationSchema`) y **entrega los valores** por `onSubmit`; el envío y el estado los pone
 * {@link JobApplySection}.
 * @param {JobApplyFormProps} props - Propiedades del formulario
 * @returns {JSX.Element} El formulario renderizado
 */
export default function JobApplyForm({
    jobCode,
    cities,
    requireTalentPool = false,
    onSubmit,
    loading = false,
    success = false,
    error,
    hideHeader = false,
}: JobApplyFormProps) {
    const t = useTranslations('Careers.form');
    const tValidations = useTranslations('Validations');

    const captchaTokenRef = useRef<string | undefined>(undefined);

    const [isDragging, setIsDragging] = useState(false);
    const [step, setStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);

    const formik = useFormik<JobApplicationFormValues>({
        initialValues: INITIAL,
        validationSchema: jobApplicationSchema(),
        onSubmit: (values) => onSubmit?.(values, captchaTokenRef.current),
    });

    const steps = [
        { key: 'who', label: t('steps.who') },
        { key: 'application', label: t('steps.application') },
        { key: 'consents', label: t('steps.consents') },
    ];

    const isLastStep = step === steps.length - 1;

    /**
     * Único punto de entrada del CV, para que el fichero soltado pase por la misma validación que el
     * elegido en el diálogo: se marca el campo como tocado para que el error de Yup se vea al momento y no
     * al pulsar enviar.
     * @param {File | null} file - El fichero elegido, o `null` al quitarlo
     */
    function selectCv(file: File | null) {
        void formik.setFieldTouched('cv', true, false);
        void formik.setFieldValue('cv', file);
    }

    /**
     * Avanza al paso siguiente **solo si lo de este paso está bien**.
     *
     * Marca como tocados los campos del paso antes de comprobar, que es lo que hace que los errores se
     * pinten: sin eso, pulsar «Siguiente» no avanzaba y tampoco decía por qué.
     */
    async function goNext() {
        const errors = await formik.validateForm();
        const failing = STEP_FIELDS[step].filter((field) => errors[field]);

        if (failing.length > 0) {
            await formik.setTouched(
                { ...formik.touched, ...Object.fromEntries(failing.map((field) => [field, true])) },
                false,
            );
            return;
        }

        const next = step + 1;
        setStep(next);
        setFurthestStep((previous) => Math.max(previous, next));
    }

    if (success) {
        return (
            <div className="careers__form careers__form--success">
                <CheckCircle aria-hidden="true" />
                <h2>{t('successTitle')}</h2>
                <p>{t('successText')}</p>
            </div>
        );
    }

    /*
     * El error del CV se **traduce** aquí porque este campo no pasa por `Input`, que es quien resuelve las
     * claves de `Validations` en el resto del formulario. Sin esto se pintaba la clave en crudo
     * («careers.cvType»), y son justo los mensajes que más se leen: el del CV es el único error que le sale
     * a casi todo el mundo que se presenta desde el móvil.
     */
    const cvErrorKey = formik.touched.cv ? (formik.errors.cv as string | undefined) : undefined;
    const cvError = cvErrorKey ? tValidations(cvErrorKey as 'careers.cvType') : undefined;

    return (
        <form id="candidatura" className="careers__form" onSubmit={formik.handleSubmit} noValidate>
            {/*
              Dentro del diálogo el título lo pone su cabecera, con el puesto y la referencia. Se oculta con
              una prop y no con CSS: un `h2` escondido con `display: none` sigue estando en el
              documento y un lector de pantalla lo anuncia igual, así que habría dos títulos.
            */}
            {!hideHeader && (
                <div className="careers__form-header">
                    <h2>{jobCode ? t('title') : t('spontaneousTitle')}</h2>
                    <p>{jobCode ? t('subtitle') : t('spontaneousSubtitle')}</p>
                </div>
            )}

            <Stepper
                steps={steps}
                currentIndex={step}
                furthestIndex={furthestStep}
                onStepClick={setStep}
            />

            {error && <p className="careers__form-error">{error}</p>}

            {step === 0 && (
                <div className="form-rows">
                    <div className="form-row form-row--cols-2">
                        <Input
                            id="ja-first-name"
                            name="firstName"
                            label={t('fields.firstName')}
                            placeholder={t('placeholders.firstName')}
                            noTranslate
                            required
                            autoComplete="given-name"
                            value={formik.values.firstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.firstName}
                            touched={formik.touched.firstName}
                            className="input__full"
                        />

                        <Input
                            id="ja-last-name"
                            name="lastName"
                            label={t('fields.lastName')}
                            placeholder={t('placeholders.lastName')}
                            noTranslate
                            required
                            autoComplete="family-name"
                            value={formik.values.lastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.lastName}
                            touched={formik.touched.lastName}
                            className="input__full"
                        />
                    </div>

                    <div className="form-row form-row--cols-2">
                        <Input
                            id="ja-email"
                            name="email"
                            type="email"
                            label={t('fields.email')}
                            placeholder={t('placeholders.email')}
                            noTranslate
                            required
                            autoComplete="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.email}
                            touched={formik.touched.email}
                            className="input__full"
                        />

                        <Input
                            id="ja-phone"
                            name="phone"
                            type="tel"
                            label={t('fields.phone')}
                            placeholder={t('placeholders.phone')}
                            noTranslate
                            autoComplete="tel"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.phone}
                            touched={formik.touched.phone}
                            className="input__full"
                        />
                    </div>

                    <div className="form-row">
                        <Select
                            id="ja-city"
                            name="citySlug"
                            label={t('fields.city')}
                            placeholder={t('placeholders.city')}
                            noTranslate
                            value={formik.values.citySlug}
                            onChange={(value) => void formik.setFieldValue('citySlug', value)}
                            options={cities.map((city) => ({ value: city.slug, label: city.name }))}
                            className="select__full"
                        />
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="form-rows">
                    {/*
                      Zona de arrastrar y soltar **encima** de un `input type="file"` real: el arrastre es la
                      comodidad, el input es el mecanismo. Con solo arrastre, quien navega con teclado o desde
                      el móvil se queda sin poder adjuntar nada.

                      `onDragOver` tiene que llamar a `preventDefault` o el navegador abre el PDF en una
                      pestaña en vez de dejarlo caer aquí.
                    */}
                    <div
                        className={`careers__form-file${isDragging ? ' careers__form-file--dragging' : ''}`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setIsDragging(false);
                            selectCv(event.dataTransfer.files?.[0] ?? null);
                        }}
                    >
                        <label className="careers__form-file-label" htmlFor="ja-cv">
                            {t('fields.cv')} <span aria-hidden="true">*</span>
                        </label>

                        <input
                            id="ja-cv"
                            name="cv"
                            type="file"
                            accept="application/pdf"
                            aria-describedby="ja-cv-hint"
                            onChange={(event) => selectCv(event.target.files?.[0] ?? null)}
                        />

                        {/* El input va oculto pero enfocable, así que esta etiqueta es el control visible. */}
                        <label className="careers__form-file-choose" htmlFor="ja-cv">
                            {t('cvChoose')}
                        </label>

                        <p className="careers__form-hint" id="ja-cv-hint">
                            {t('cvDrop')}
                        </p>

                        {formik.values.cv ? (
                            <p className="careers__form-file-chosen">
                                <FileTextIcon size={16} aria-hidden="true" />
                                {formik.values.cv.name} ·{' '}
                                {Math.max(1, Math.round(formik.values.cv.size / 1024))} KB
                                <button
                                    type="button"
                                    aria-label={t('cvRemove')}
                                    onClick={() => selectCv(null)}
                                >
                                    <XIcon size={14} aria-hidden="true" />
                                </button>
                            </p>
                        ) : (
                            <p className="careers__form-hint">{t('cvHint')}</p>
                        )}

                        {cvError && <p className="careers__form-error">{cvError}</p>}
                    </div>

                    <div className="form-row">
                        <Textarea
                            id="ja-cover-letter"
                            name="coverLetter"
                            label={t('fields.coverLetter')}
                            placeholder={t('placeholders.coverLetter')}
                            noTranslate
                            rows={5}
                            maxLength={4000}
                            value={formik.values.coverLetter}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.coverLetter}
                            touched={formik.touched.coverLetter}
                            className="input__full"
                        />
                    </div>

                    <div className="form-row">
                        <Input
                            id="ja-linkedin"
                            name="linkedinUrl"
                            type="url"
                            label={t('fields.linkedin')}
                            placeholder={t('placeholders.linkedin')}
                            noTranslate
                            value={formik.values.linkedinUrl}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.linkedinUrl}
                            touched={formik.touched.linkedinUrl}
                            className="input__full"
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="form-rows">
                    <p className="careers__form-hint">{t('noPhoto')}</p>

                    <label className="careers__form-check">
                        <input
                            type="checkbox"
                            name="privacyNoticeAcknowledged"
                            checked={formik.values.privacyNoticeAcknowledged}
                            onChange={formik.handleChange}
                        />
                        <span>
                            {t.rich('privacy', {
                                link: (chunks) => <Link href="/privacy-policy">{chunks}</Link>,
                            })}
                        </span>
                    </label>
                    {formik.touched.privacyNoticeAcknowledged &&
                        formik.errors.privacyNoticeAcknowledged && (
                            <p className="careers__form-error">
                                {tValidations(
                                    formik.errors.privacyNoticeAcknowledged as 'careers.privacyRequired',
                                )}
                            </p>
                        )}

                    <label className="careers__form-check">
                        <input
                            type="checkbox"
                            name="talentPoolConsent"
                            checked={formik.values.talentPoolConsent}
                            onChange={formik.handleChange}
                        />
                        <span>{t('talentPool')}</span>
                    </label>
                    {requireTalentPool && !formik.values.talentPoolConsent && (
                        <p className="careers__form-hint">{t('talentPoolRequired')}</p>
                    )}

                    {/* Campo trampa: oculto por CSS y sin `tabindex`, así que un humano nunca lo rellena. */}
                    <input
                        type="text"
                        className="careers__form-honeypot"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        name={HONEYPOT_FIELD_NAME}
                        value={formik.values.honeypot}
                        onChange={(event) => void formik.setFieldValue('honeypot', event.target.value)}
                    />

                    <Captcha onVerify={(token) => (captchaTokenRef.current = token)} />
                </div>
            )}

            <div className="careers__form-actions">
                {step > 0 && (
                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                        <ArrowLeftIcon size={18} aria-hidden="true" />
                        {t('back')}
                    </Button>
                )}

                {isLastStep ? (
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading || (requireTalentPool && !formik.values.talentPoolConsent)}
                    >
                        <SendIcon size={18} aria-hidden="true" />
                        {loading ? t('submitting') : t('submit')}
                    </Button>
                ) : (
                    <Button type="button" variant="primary" onClick={() => void goNext()}>
                        {t('next')}
                        <ArrowRightIcon size={18} aria-hidden="true" />
                    </Button>
                )}
            </div>
        </form>
    );
}
