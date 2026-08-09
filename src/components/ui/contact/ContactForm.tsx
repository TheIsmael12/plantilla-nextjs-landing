'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useFormik } from 'formik';
import { CheckCircle, SendIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import Input from '@/components/ui/inputs/Input';
import Textarea from '@/components/ui/inputs/Textarea';
import Button from '@/components/ui/buttons/Button';
import Captcha from '@/components/ui/inputs/Captcha';

import { HONEYPOT_FIELD_NAME } from '@/config/settings';
import { contactSchema } from '@/schemas/contact.schema';
import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactForm.scss';

const INITIAL: ContactFormValues = {
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    message: '',
    privacyNoticeAcknowledged: false,
    marketingConsent: false,
    attributionConsent: false,
    honeypot: '',
};

/**
 * Formulario de contacto del sistema de diseño: valida con Formik + Yup
 * (`contactSchema`), traduce toda la copia mediante `Contact.form`, y
 * alterna entre estado de envío (`loading`), error a nivel de formulario
 * (`error`) y confirmación de éxito (`success`).
 *
 * Incluye lo que exige el backend público de leads (RGPD/LSSI): nombre,
 * email o teléfono, checkbox de privacidad obligatorio, checkboxes
 * opcionales de marketing/atribución sin premarcar, un campo trampa oculto
 * (honeypot, nunca recibe foco real) y el widget de Turnstile.
 * @param {ContactFormProps} props - Propiedades del formulario
 * @returns {JSX.Element} El formulario de contacto renderizado
 */
export default function ContactForm({
    onSubmit,
    loading = false,
    success = false,
    error,
}: ContactFormProps) {

    const t = useTranslations('Contact.form');
    const captchaTokenRef = useRef<string | undefined>(undefined);

    const formik = useFormik<ContactFormValues>({
        initialValues: INITIAL,
        validationSchema: contactSchema(),
        onSubmit: (values) => onSubmit?.(values, captchaTokenRef.current),
    });

    if (success) {
        return (
            <div className="contact__form contact__form--success">
                <div className="contact__form-success">
                    <CheckCircle aria-hidden="true" />
                    <p>{t('success')}</p>
                </div>
            </div>
        );
    }

    return (

        <form className="contact__form" onSubmit={formik.handleSubmit} noValidate>

            <div className="contact__form-header">
                <h2 className="contact__title-lg">{t('title')}</h2>
                <p className="contact__text-muted">{t('subtitle')}</p>
            </div>

            {error && <p className="contact__form-global-error">{error}</p>}

            <div className="contact__form-grid">

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
                    id="cf-company-name"
                    name="companyName"
                    label={t('fields.companyName')}
                    type="text"
                    placeholder={t('placeholders.companyName')}
                    noTranslate
                    autoComplete="organization"
                    value={formik.values.companyName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.companyName}
                    touched={formik.touched.companyName}
                    className="input__full"
                />

                <Input
                    id="cf-email"
                    name="email"
                    label={t('fields.email')}
                    type="text"
                    placeholder={t('placeholders.email')}
                    noTranslate
                    autoComplete="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.email}
                    touched={formik.touched.email}
                    className="input__full"
                />

                <Input
                    id="cf-phone"
                    name="phone"
                    label={t('fields.phone')}
                    type="tel"
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

                <div className="contact__form-full">
                    <p className="contact__form-hint">{t('contactHint')}</p>
                </div>

                <div className="contact__form-full">
                    <Textarea
                        id="cf-message"
                        name="message"
                        label={t('fields.message')}
                        placeholder={t('placeholders.message')}
                        noTranslate
                        rows={5}
                        value={formik.values.message}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.message}
                        touched={formik.touched.message}
                    />
                </div>

            </div>

            {/* Campo trampa: oculto visualmente y fuera del flujo de tabulación,
                pero presente en el DOM para que los bots que rellenan todos los
                campos automáticamente caigan en él. Nunca debe llevar `display:none`
                (algunos rastreadores de spam lo detectan y lo evitan). */}
            <div className="contact__form-honeypot" aria-hidden="true">
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

            <fieldset className="contact__form-consents">
                <legend className="sr-only">{t('consents.privacyLabel')}</legend>

                <div className="contact__form-consent">
                    <input
                        id="cf-privacy"
                        name="privacyNoticeAcknowledged"
                        type="checkbox"
                        className="contact__form-checkbox"
                        checked={formik.values.privacyNoticeAcknowledged}
                        onChange={(e) => formik.setFieldValue('privacyNoticeAcknowledged', e.target.checked)}
                        aria-label={t('consents.privacyLabel')}
                    />
                    <label htmlFor="cf-privacy" className="contact__form-consent-text">
                        {t('consents.privacyLabel')}{' '}
                        <Link href="/privacy-policy">{t('consents.privacyLink')}</Link> *
                    </label>
                </div>
                {formik.errors.privacyNoticeAcknowledged && formik.touched.privacyNoticeAcknowledged && (
                    <p className="label__error">* {t('contactHint')}</p>
                )}

                <div className="contact__form-consent">
                    <input
                        id="cf-marketing"
                        name="marketingConsent"
                        type="checkbox"
                        className="contact__form-checkbox"
                        checked={formik.values.marketingConsent}
                        onChange={(e) => formik.setFieldValue('marketingConsent', e.target.checked)}
                        aria-label={t('consents.marketingLabel')}
                    />
                    <label htmlFor="cf-marketing" className="contact__form-consent-text">
                        {t('consents.marketingLabel')}
                    </label>
                </div>

                <div className="contact__form-consent">
                    <input
                        id="cf-attribution"
                        name="attributionConsent"
                        type="checkbox"
                        className="contact__form-checkbox"
                        checked={formik.values.attributionConsent}
                        onChange={(e) => formik.setFieldValue('attributionConsent', e.target.checked)}
                        aria-label={t('consents.attributionLabel')}
                    />
                    <label htmlFor="cf-attribution" className="contact__form-consent-text">
                        {t('consents.attributionLabel')}
                    </label>
                </div>
            </fieldset>

            <Captcha
                onVerify={(token) => {
                    captchaTokenRef.current = token;
                }}
                onExpire={() => {
                    captchaTokenRef.current = undefined;
                }}
            />

            <div className="contact__form-footer">
                <p className="contact__form-privacy">
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
