import { getTranslations } from 'next-intl/server';

import { getApplicationStatus } from '@/actions/careers/careers-actions';

import ApplicationTracking from '@/components/ui/careers/ApplicationTracking';

import '@/styles/04-components/careers/careersBase.scss';
import '@/styles/04-components/careers/careersDetail.scss';

/**
 * Props de {@link ApplicationStatusViewPage}.
 * @interface ApplicationStatusViewPageProps
 * @property {string} token - Token del enlace de seguimiento
 * @property {string} locale - Idioma de la página
 */
interface ApplicationStatusViewPageProps {
    token: string;
    locale: string;
}

/**
 * Seguimiento de una candidatura (`/empleo/candidatura/[token]`).
 *
 * Un token que no existe y uno caducado enseñan **lo mismo**: una página neutra. Distinguirlos permitiría
 * comprobar si una referencia existe, y no hay ninguna razón para que alguien pueda hacer eso.
 *
 * La página va `noindex, nofollow` desde el `generateMetadata` de la ruta y bloqueada en `robots.ts`: es la
 * información de una sola persona.
 * @param {ApplicationStatusViewPageProps} props - Token e idioma
 * @returns {Promise<JSX.Element>} El seguimiento renderizado
 */
export default async function ApplicationStatusViewPage({
    token,
    locale,
}: ApplicationStatusViewPageProps) {
    const t = await getTranslations({ locale, namespace: 'Careers.tracking' });

    const response = await getApplicationStatus(token, locale);

    if (!response.data) {
        return (
            <main className="careers">
                <section className="careers__section">
                    <div className="careers__container careers__closed">
                        <h1>{t('invalidTitle')}</h1>
                        <p>{t('invalidText')}</p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="careers">
            <section className="careers__section">
                <div className="careers__container">
                    <ApplicationTracking application={response.data} token={token} />
                </div>
            </section>
        </main>
    );
}
