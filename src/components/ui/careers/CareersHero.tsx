import { useTranslations } from 'next-intl';

import '@/styles/04-components/careers/careersBase.scss';

/**
 * Cabecera del buscador de empleo.
 *
 * El número de ofertas y de ciudades va aquí y no en el título de la página: es lo que hace creíble la
 * sección —una cabecera genérica sobre un listado vacío es lo que hace pensar que la empresa no contrata—,
 * pero un `<title>` que cambia cada día es inestable para el índice de un buscador.
 * @param {CareersHeroProps} props - Propiedades del componente
 * @returns {JSX.Element} La cabecera renderizada
 */
export default function CareersHero({ totalJobs, totalCities }: CareersHeroProps) {
    const t = useTranslations('Careers.hero');

    return (
        <section className="careers__hero">
            <div className="careers__container">
                <h1 className="careers__hero-title">{t('title')}</h1>
                <p className="careers__hero-subtitle">{t('subtitle')}</p>

                <p className="careers__hero-count">
                    {totalJobs > 0 && totalCities > 0
                        ? t('countWithCities', { jobs: totalJobs, cities: totalCities })
                        : t('count', { count: totalJobs })}
                </p>
            </div>
        </section>
    );
}
