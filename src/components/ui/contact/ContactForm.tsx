'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useFormik } from 'formik';
import { CheckCircle, SendIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import Input from '@/components/ui/inputs/Input';
import Select from '@/components/ui/inputs/Select';
import Textarea from '@/components/ui/inputs/Textarea';
import Button from '@/components/ui/buttons/Button';
import Captcha from '@/components/ui/inputs/Captcha';

import { HONEYPOT_FIELD_NAME } from '@/config/settings';
import {
    CONTACT_PROFILES,
    PROPERTY_MANAGER_PROFILE,
    SERVICE_INTERESTS,
    TIMEFRAMES,
} from '@/config/leadQualification';
import { ZONES } from '@/config/zones';
import { contactSchema } from '@/schemas/contact.schema';
import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactForm.scss';

/**
 * Los cuatro campos que gobierna un desplegable de cualificación.
 *
 * Escritos aquí y no como `keyof ContactFormValues`: el formulario tiene además tres booleanos de
 * consentimiento, y con la clave abierta el valor del desplegable pasaba a ser `string | boolean`.
 */
type QualificationSelectField = 'contactProfile' | 'serviceInterest' | 'zone' | 'timeframe';

const INITIAL: ContactFormValues = {
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    message: '',
    // Cadena vacía y no una primera opción preseleccionada: «no ha contestado» tiene que distinguirse de
    // haber elegido, o el CRM se llena de comunidades de propietarios que nadie declaró.
    contactProfile: '',
    serviceInterest: '',
    zone: '',
    timeframe: '',
    managedPropertiesCount: '',
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
 * Además de los datos de contacto pregunta cuatro cosas que sirven para atender mejor: qué es quien
 * escribe, qué servicio le interesa, en qué municipio y para cuándo (y, solo a un administrador de
 * fincas, cuántas gestiona). Los cuatro son **opcionales**: son lo que permite repartir la bandeja sin
 * leerse cada mensaje, pero exigirlos convertiría un formulario de contacto en un cuestionario.
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
    // La casilla de privacidad se pinta a mano, así que aquí hay que resolver la clave del error contra
    // `Validations` igual que hace `Input` por dentro con su prop `error`.
    const tValidations = useTranslations('Validations');
    const captchaTokenRef = useRef<string | undefined>(undefined);

    const formik = useFormik<ContactFormValues>({
        initialValues: INITIAL,
        validationSchema: contactSchema(),
        onSubmit: (values) => onSubmit?.(values, captchaTokenRef.current),
    });

    /**
     * Props comunes de los cuatro desplegables de cualificación.
     *
     * `Select` no emite un evento del DOM sino el valor ya elegido, así que `formik.handleChange` no
     * sirve: hay que escribirlo con `setFieldValue`. Y marcarlo como tocado a la vez, porque tampoco
     * hay `onBlur` — sin eso el error de un valor no válido no se pintaría nunca.
     * @param {QualificationSelectField} field - Campo del formulario que controla el desplegable
     * @returns Las props de valor, cambio, error y ancho
     */
    const selectFieldProps = (field: QualificationSelectField) => ({
        value: formik.values[field],
        onChange: (value: string) => {
            void formik.setFieldValue(field, value);
            void formik.setFieldTouched(field, true);
        },
        error: formik.errors[field],
        touched: formik.touched[field],
        className: 'select__full',
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

                <Select
                    id="cf-profile"
                    name="contactProfile"
                    label={t('fields.contactProfile')}
                    placeholder={t('placeholders.contactProfile')}
                    noTranslate
                    options={CONTACT_PROFILES.map((value) => ({
                        value,
                        label: t(`options.profile.${value}`),
                    }))}
                    {...selectFieldProps('contactProfile')}
                />

                <Select
                    id="cf-service"
                    name="serviceInterest"
                    label={t('fields.serviceInterest')}
                    placeholder={t('placeholders.serviceInterest')}
                    noTranslate
                    options={SERVICE_INTERESTS.map((value) => ({
                        value,
                        label: t(`options.service.${value}`),
                    }))}
                    {...selectFieldProps('serviceInterest')}
                />

                {/*
                    Los municipios salen de `ZONES`, la misma lista que genera las 20 páginas de
                    zona: el nombre que se lee aquí y el de la página desde la que ha llegado quien escribe
                    son el mismo dato, no dos copias que puedan discrepar.
                */}
                <Select
                    id="cf-zone"
                    name="zone"
                    label={t('fields.zone')}
                    placeholder={t('placeholders.zone')}
                    noTranslate
                    options={ZONES.map((item) => ({ value: item.slug, label: item.name }))}
                    {...selectFieldProps('zone')}
                />

                <Select
                    id="cf-timeframe"
                    name="timeframe"
                    label={t('fields.timeframe')}
                    placeholder={t('placeholders.timeframe')}
                    noTranslate
                    options={TIMEFRAMES.map((value) => ({
                        value,
                        label: t(`options.timeframe.${value}`),
                    }))}
                    {...selectFieldProps('timeframe')}
                />

                {/*
                    El número de fincas solo aparece si el perfil es administrador.

                    Preguntárselo a todo el mundo sería preguntar por algo que a la mayoría no le aplica, y
                    el backend además responde 400 si llega con otro perfil. Sale al elegir, junto al
                    desplegable que lo provoca, y no al final del formulario.
                */}
                {formik.values.contactProfile === PROPERTY_MANAGER_PROFILE && (
                    <Input
                        id="cf-managed-properties"
                        name="managedPropertiesCount"
                        label={t('fields.managedPropertiesCount')}
                        type="number"
                        placeholder={t('placeholders.managedPropertiesCount')}
                        noTranslate
                        min={1}
                        value={formik.values.managedPropertiesCount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.managedPropertiesCount}
                        touched={formik.touched.managedPropertiesCount}
                        className="input__full"
                    />
                )}

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
                {/*
                    El mensaje sale del error del propio campo, no de `contactHint`.
                    Pintaba el aviso de «indica un correo o un teléfono» —copiado del par de contacto de
                    arriba—, así que al no marcar la casilla de privacidad el formulario se quejaba de un
                    campo que estaba bien relleno y no decía nada de la casilla, que era lo que faltaba.
                */}
                {formik.errors.privacyNoticeAcknowledged && formik.touched.privacyNoticeAcknowledged && (
                    <p className="label__error">
                        * {tValidations(formik.errors.privacyNoticeAcknowledged)}
                    </p>
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
