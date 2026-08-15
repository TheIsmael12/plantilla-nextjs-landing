'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useFormik } from 'formik';
import { CheckCircle, SendIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import Input from '@/components/ui/inputs/Input';
import Textarea from '@/components/ui/inputs/Textarea';
import Select from '@/components/ui/inputs/Select';
import Button from '@/components/ui/buttons/Button';
import Captcha from '@/components/ui/inputs/Captcha';

import { HONEYPOT_FIELD_NAME } from '@/config/settings';
import { complaintSchema } from '@/schemas/complaint.schema';
import '@/styles/04-components/complaints/complaintForm.scss';

const INITIAL: ComplaintFormValues = {
    type: '',
    affectedCommunityName: '',
    serviceDate: '',
    serviceDescription: '',
    description: '',
    isAnonymous: false,
    contactName: '',
    contactEmail: '',
    privacyNoticeAcknowledged: false,
    honeypot: '',
};

/**
 * Formulario del canal de reclamaciones (requisitos-reclamaciones.md, sección 3): valida con
 * Formik + Yup (`complaintSchema`), traduce toda la copia mediante `Complaints.form`, y alterna
 * entre estado de envío (`loading`), error a nivel de formulario (`error`) y confirmación de
 * éxito (`success`) — mismo esqueleto que `ContactForm.tsx`.
 *
 * Dos particularidades sobre el formulario de contacto:
 * - El desplegable de `type` decide si se muestran los campos de servicio (comunidad afectada,
 *   fecha, descripción del servicio), solo obligatorios para `SERVICE_QUALITY`.
 * - El checkbox "prefiero no identificarme" oculta y limpia nombre/email de contacto: no es un
 *   campo opcional que se puede dejar vacío por descuido, es una decisión explícita (sección 1.3).
 * @param {ComplaintFormProps} props - Propiedades del formulario
 * @returns {JSX.Element} El formulario del canal de reclamaciones renderizado
 */
export default function ComplaintForm({
    onSubmit,
    loading = false,
    success = false,
    error,
}: ComplaintFormProps) {

    const t = useTranslations('Complaints.form');
    const captchaTokenRef = useRef<string | undefined>(undefined);

    const formik = useFormik<ComplaintFormValues>({
        initialValues: INITIAL,
        validationSchema: complaintSchema(),
        onSubmit: (values) => onSubmit?.(values, captchaTokenRef.current),
    });

    if (success) {
        return (
            <div className="complaint__form complaint__form--success">
                <div className="complaint__form-success">
                    <CheckCircle aria-hidden="true" />
                    <p>{t('success')}</p>
                </div>
            </div>
        );
    }

    const handleAnonymousChange = (checked: boolean) => {
        formik.setFieldValue('isAnonymous', checked);
        // Limpia nombre/email al marcar anonimato: si se dejaran los valores rellenos y el
        // visitante desmarca luego la casilla sin volver a escribir, se enviarían datos que ya
        // había decidido no dar.
        if (checked) {
            formik.setFieldValue('contactName', '');
            formik.setFieldValue('contactEmail', '');
        }
    };

    return (

        <form className="complaint__form" onSubmit={formik.handleSubmit} noValidate>

            <div className="complaint__form-header">
                <h2 className="contact__title-lg">{t('title')}</h2>
                <p className="contact__text-muted">{t('subtitle')}</p>
            </div>

            {error && <p className="complaint__form-global-error">{error}</p>}

            <div className="complaint__form-grid">

                <div className="complaint__form-full">
                    <Select
                        id="cf-type"
                        name="type"
                        label={t('fields.type')}
                        placeholder={t('placeholders.type')}
                        noTranslate
                        required
                        options={[
                            { value: 'SERVICE_QUALITY', label: t('typeOptions.serviceQuality') },
                            { value: 'ETHICS_COMPLIANCE', label: t('typeOptions.ethicsCompliance') },
                        ]}
                        value={formik.values.type}
                        onChange={(value) => formik.setFieldValue('type', value)}
                        error={formik.errors.type}
                        touched={formik.touched.type}
                        className="input__full"
                    />
                </div>

                {formik.values.type === 'SERVICE_QUALITY' && (
                    <>
                        <Input
                            id="cf-affected-community"
                            name="affectedCommunityName"
                            label={t('fields.affectedCommunityName')}
                            type="text"
                            placeholder={t('placeholders.affectedCommunityName')}
                            noTranslate
                            required
                            value={formik.values.affectedCommunityName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.affectedCommunityName}
                            touched={formik.touched.affectedCommunityName}
                            className="input__full"
                        />

                        <Input
                            id="cf-service-date"
                            name="serviceDate"
                            label={t('fields.serviceDate')}
                            type="date"
                            noTranslate
                            required
                            value={formik.values.serviceDate}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.serviceDate}
                            touched={formik.touched.serviceDate}
                            className="input__full"
                        />

                        <div className="complaint__form-full">
                            <Textarea
                                id="cf-service-description"
                                name="serviceDescription"
                                label={t('fields.serviceDescription')}
                                placeholder={t('placeholders.serviceDescription')}
                                noTranslate
                                required
                                rows={3}
                                value={formik.values.serviceDescription}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.serviceDescription}
                                touched={formik.touched.serviceDescription}
                            />
                        </div>
                    </>
                )}

                <div className="complaint__form-full">
                    <Textarea
                        id="cf-description"
                        name="description"
                        label={t('fields.description')}
                        placeholder={t('placeholders.description')}
                        noTranslate
                        required
                        rows={5}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.description}
                        touched={formik.touched.description}
                    />
                </div>

            </div>

            <div className="complaint__form-anonymous">
                <input
                    id="cf-anonymous"
                    name="isAnonymous"
                    type="checkbox"
                    className="complaint__form-checkbox"
                    checked={formik.values.isAnonymous}
                    onChange={(e) => handleAnonymousChange(e.target.checked)}
                    aria-label={t('anonymous.label')}
                />
                <label htmlFor="cf-anonymous" className="complaint__form-anonymous-text">
                    <strong>{t('anonymous.label')}</strong>
                    <span>{t('anonymous.description')}</span>
                </label>
            </div>

            {!formik.values.isAnonymous && (
                <div className="complaint__form-grid">
                    <Input
                        id="cf-contact-name"
                        name="contactName"
                        label={t('fields.contactName')}
                        type="text"
                        placeholder={t('placeholders.contactName')}
                        noTranslate
                        required
                        autoComplete="name"
                        value={formik.values.contactName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.contactName}
                        touched={formik.touched.contactName}
                        className="input__full"
                    />

                    <Input
                        id="cf-contact-email"
                        name="contactEmail"
                        label={t('fields.contactEmail')}
                        type="email"
                        placeholder={t('placeholders.contactEmail')}
                        noTranslate
                        required
                        autoComplete="email"
                        value={formik.values.contactEmail}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.contactEmail}
                        touched={formik.touched.contactEmail}
                        className="input__full"
                    />
                </div>
            )}

            {/* Campo trampa: oculto visualmente y fuera del flujo de tabulación, pero presente
                en el DOM para que los bots que rellenan todos los campos automáticamente caigan
                en él. Nunca lleva `display:none` (algunos rastreadores de spam lo detectan). */}
            <div className="complaint__form-honeypot" aria-hidden="true">
                <label htmlFor="cf-website">Website</label>
                <input
                    id="cf-website"
                    name={HONEYPOT_FIELD_NAME}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formik.values.honeypot}
                    onChange={(e) => formik.setFieldValue('honeypot', e.target.value)}
                />
            </div>

            <fieldset>
                <legend className="sr-only">{t('consents.privacyLabel')}</legend>

                <div className="complaint__form-consent">
                    <input
                        id="cf-privacy"
                        name="privacyNoticeAcknowledged"
                        type="checkbox"
                        className="complaint__form-checkbox"
                        checked={formik.values.privacyNoticeAcknowledged}
                        onChange={(e) => formik.setFieldValue('privacyNoticeAcknowledged', e.target.checked)}
                        aria-label={t('consents.privacyLabel')}
                    />
                    <label htmlFor="cf-privacy" className="complaint__form-consent-text">
                        {t('consents.privacyLabel')}{' '}
                        <Link href="/privacy-policy">{t('consents.privacyLink')}</Link> *
                    </label>
                </div>
                {formik.errors.privacyNoticeAcknowledged && formik.touched.privacyNoticeAcknowledged && (
                    <p className="label__error">* {t('privacyHint')}</p>
                )}
            </fieldset>

            <Captcha
                onVerify={(token) => {
                    captchaTokenRef.current = token;
                }}
                onExpire={() => {
                    captchaTokenRef.current = undefined;
                }}
            />

            <div className="complaint__form-footer">
                <p className="complaint__form-privacy">
                    {t('privacy')}{' '}
                    <Link href="/privacy-policy">{t('privacyLink')}</Link>
                </p>
                <Button
                    title={loading ? 'submitting' : 'submit'}
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={loading || formik.isSubmitting}
                >
                    <SendIcon aria-hidden="true" />
                </Button>
            </div>

        </form>

    )

}
