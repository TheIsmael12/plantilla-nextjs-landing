'use client';

import { useRef, useState } from 'react';

import { useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import { CheckCircle, FileTextIcon, SendIcon, XIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import Button from '@/components/ui/buttons/Button';
import Captcha from '@/components/ui/inputs/Captcha';
import Input from '@/components/ui/inputs/Input';
import Textarea from '@/components/ui/inputs/Textarea';

import { HONEYPOT_FIELD_NAME } from '@/config/settings';

import { jobApplicationSchema } from '@/schemas/careers.schema';

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
 * Formulario de candidatura (requisitos-empleo.md, sección 4.2).
 *
 * Lo que **no** pide es tan importante como lo que pide: no hay fotografía, ni fecha de nacimiento, ni
 * nacionalidad, ni sexo, ni DNI. No están ni como campo opcional, y se dice en el propio formulario: un dato
 * que no está no puede influir en la decisión.
 *
 * El CV se comprueba en el navegador antes de subir —solo PDF, hasta 5 MB— porque dejar que se suban 20 MB
 * para que el servidor los rechace es gastar la conexión de quien se presenta, que muchas veces está en el
 * móvil. El mensaje de error dice **qué hacer**, no qué ha pasado.
 *
 * Es presentacional, igual que {@link ContactForm} y con el mismo contrato: valida con Formik + Yup
 * (`jobApplicationSchema`) y **entrega los valores** por `onSubmit`; el envío y el estado los pone
 * {@link JobApplySection}. Así el formulario no sabe nada de acciones de servidor ni de cómo viaja el
 * fichero, que es lo que hace el resto de formularios del proyecto.
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
}: JobApplyFormProps) {
    const t = useTranslations('Careers.form');
    const tValidations = useTranslations('Validations');

    const captchaTokenRef = useRef<string | undefined>(undefined);

    const [isDragging, setIsDragging] = useState(false);

    const formik = useFormik<JobApplicationFormValues>({
        initialValues: INITIAL,
        validationSchema: jobApplicationSchema(),
        onSubmit: (values) => onSubmit?.(values, captchaTokenRef.current),
    });

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
            <div className="careers__form-header">
                <h2>{jobCode ? t('title') : t('spontaneousTitle')}</h2>
                <p>{jobCode ? t('subtitle') : t('spontaneousSubtitle')}</p>
            </div>

            {error && <p className="careers__form-error">{error}</p>}

            <div className="careers__form-grid">
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

                <div className="careers__form-field">
                    <label htmlFor="ja-city">{t('fields.city')}</label>
                    <select
                        id="ja-city"
                        name="citySlug"
                        value={formik.values.citySlug}
                        onChange={formik.handleChange}
                    >
                        <option value="" />
                        {cities.map((city) => (
                            <option key={city.slug} value={city.slug}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>

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

            {/*
              Zona de arrastrar y soltar **encima** de un `input type="file"` real: el arrastre es la
              comodidad, el input es el mecanismo. Con solo arrastre, quien navega con teclado o desde el
              móvil se queda sin poder adjuntar nada.

              `onDragOver` tiene que llamar a `preventDefault` o el navegador abre el PDF en una pestaña en
              vez de dejarlo caer aquí.
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
            {formik.touched.privacyNoticeAcknowledged && formik.errors.privacyNoticeAcknowledged && (
                <p className="careers__form-error">{formik.errors.privacyNoticeAcknowledged}</p>
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

            <Button
                type="submit"
                variant="primary"
                disabled={loading || (requireTalentPool && !formik.values.talentPoolConsent)}
            >
                <SendIcon size={18} aria-hidden="true" />
                {loading ? t('submitting') : t('submit')}
            </Button>
        </form>
    );
}
