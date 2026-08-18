'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { submitContactLead } from '@/actions/leads/leads-actions';
import { PRIVACY_NOTICE_VERSION } from '@/config/settings';
import { pushLeadGenerated } from '@/lib/gtm';
import { isErrorStatus } from '@/utils/httpStatusUtils';
import { readAttribution } from '@/utils/leadAttributionUtils';

import ContactHero from '@/components/ui/contact/ContactHero';
import ContactDepartments from '@/components/ui/contact/ContactDepartments';
import ContactForm from '@/components/ui/contact/ContactForm';
import ContactMapSection from '@/components/ui/contact/ContactMapSection';
import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactPage.scss';

/** Identificadores con los que este formulario viaja a la analítica (`form_id`/`lead_type` en el contenedor de GTM). */
const LEAD_FORM_ID = 'contacto';
const LEAD_TYPE = 'contacto-general';

/**
 * Página de contacto: hero con los datos que respaldan la atención directa
 * ({@link ContactHero}), formulario ({@link ContactForm}) junto al mapa
 * ({@link ContactMapSection}), y la sección de departamentos
 * ({@link ContactDepartments}) para dirigir cada consulta al equipo
 * adecuado. Gestiona el ciclo de envío del formulario
 * (`loading`/`success`/`formError`) delegando la validación en
 * `ContactForm` y el envío real en `submitContactLead` (POST /public/leads).
 * @returns {JSX.Element} La página de contacto renderizada
 */
export default function ContactViewPage() {
    const t = useTranslations('Contact');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState<string | undefined>();

    /**
     * Envía los datos del formulario de contacto al backend y actualiza el
     * estado de carga/éxito/error de la página. El honeypot y el captcha no
     * cambian el flujo visible: el backend responde `201` igual si descarta
     * el envío en silencio (anti-enumeración), así que un envío "aceptado"
     * aquí no garantiza que se haya creado un lead real.
     * @param {ContactFormValues} values - Valores validados del formulario
     * @param {string} [captchaToken] - Token de Turnstile, si el widget está activo y se resolvió
     * @returns {Promise<void>} Se resuelve cuando finaliza el intento de envío
     */
    async function handleSubmit(values: ContactFormValues, captchaToken?: string) {
        setLoading(true);
        setFormError(undefined);

        const response = await submitContactLead({
            contactName: values.contactName,
            email: values.email || undefined,
            phone: values.phone || undefined,
            companyName: values.companyName || undefined,
            message: values.message || undefined,
            privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
            privacyNoticeAcknowledged: values.privacyNoticeAcknowledged,
            marketingConsent: values.marketingConsent,
            attributionConsent: values.attributionConsent,
            captchaToken,
            honeypot: values.honeypot || undefined,
            ...(values.attributionConsent ? readAttribution() : {}),
        });

        setLoading(false);

        if (isErrorStatus(response.status)) {
            setFormError(response.message || t('form.error'));
            return;
        }

        /*
         * La conversión se mide aquí, con el envío ya confirmado por el
         * backend, y no al pulsar el botón: un envío que falla no es un lead.
         *
         * El honeypot se descuenta a mano porque el backend responde `201`
         * también cuando descarta el envío en silencio (anti-enumeración), así
         * que su respuesta no distingue el lead real del spam. Lo que sí se
         * sabe aquí es si la trampa venía rellena, y ese caso no se cuenta:
         * esta métrica va a decidir el gasto en anuncios, y un contador
         * inflado por bots haría tomar la decisión al revés.
         *
         * Lo que no se puede descontar desde aquí es un envío rechazado por el
         * captcha, que llega igual con `201` y sin señal de que lo fuera.
         */
        if (!values.honeypot) {
            pushLeadGenerated(LEAD_FORM_ID, LEAD_TYPE);
        }

        setSuccess(true);
    }

    return (
        <main className="contact">

            <ContactHero />

            <section className="contact__content">
                <div className="contact__container contact__content-grid">

                    <div className="contact__content-form">
                        <ContactForm
                            loading={loading}
                            success={success}
                            error={formError}
                            onSubmit={handleSubmit}
                        />
                    </div>

                    <div className="contact__content-map">
                        <ContactMapSection />
                    </div>

                </div>
            </section>

            <ContactDepartments />

        </main>
    );
}
