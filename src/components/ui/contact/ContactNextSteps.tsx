import { useTranslations } from 'next-intl';

import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactNextSteps.scss';

interface Step {
    title: string;
    description: string;
    timing: string;
}

/**
 * Qué pasa después de enviar el formulario: los cuatro pasos hasta el presupuesto, con el plazo de cada uno.
 *
 * Va debajo del formulario y no encima a propósito. Quien llega decidido no debería tener que pasar por
 * encima de una explicación para escribir; y quien duda si enviar suele bajar buscando exactamente esto —el
 * plazo de respuesta y si hay visita— antes de rellenar nada.
 * @returns {JSX.Element} Los pasos posteriores al formulario renderizados
 */
export default function ContactNextSteps() {
    const t = useTranslations('Contact.nextSteps');
    const steps = t.raw('steps') as Step[];

    return (
        <section className="contact__next-steps">
            <div className="contact__container">
                <div className="contact__next-steps-header">
                    <p className="contact__eyebrow">{t('eyebrow')}</p>
                    <h2 className="contact__title-lg">{t('title')}</h2>
                    <p className="contact__next-steps-subtitle">{t('subtitle')}</p>
                </div>

                <ol className="contact__next-steps-list">
                    {steps.map((step, index) => (
                        <li className="contact__next-step" key={step.title}>
                            <span className="contact__next-step-number" aria-hidden="true">
                                {index + 1}
                            </span>
                            <h3 className="contact__next-step-title">{step.title}</h3>
                            <p className="contact__next-step-timing">{step.timing}</p>
                            <p className="contact__next-step-description">{step.description}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
