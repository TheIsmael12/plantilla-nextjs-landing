'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import ContactHero from '@/components/ui/contact/ContactHero';
import ContactDepartments from '@/components/ui/contact/ContactDepartments';
import ContactForm from '@/components/ui/contact/ContactForm';
import ContactMapSection from '@/components/ui/contact/ContactMapSection';
import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactPage.scss';

/**
 * Página de contacto: hero con los datos que respaldan la atención directa
 * ({@link ContactHero}), formulario ({@link ContactForm}) junto al mapa
 * ({@link ContactMapSection}), y la sección de departamentos
 * ({@link ContactDepartments}) para dirigir cada consulta al equipo
 * adecuado. Gestiona el ciclo de envío del formulario
 * (`loading`/`success`/`formError`) delegando la validación en
 * `ContactForm`.
 * @returns {JSX.Element} La página de contacto renderizada
 */
export default function ContactViewPage() {
    const t = useTranslations('Contact');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState<string | undefined>();

    /**
     * Envía los datos del formulario de contacto y actualiza el estado de
     * carga/éxito/error de la página.
     * @returns {Promise<void>} Se resuelve cuando finaliza el intento de envío
     */
    async function handleSubmit(/* values: ContactFormValues */) {
        setLoading(true);
        setFormError(undefined);
        try {
            // TODO: wire up actual API call (e.g. server action)
            await new Promise<void>(r => setTimeout(r, 1200));
            setSuccess(true);
        } catch {
            setFormError(t('form.error'));
        } finally {
            setLoading(false);
        }
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
