import { notFound } from 'next/navigation';

import { getTranslations } from 'next-intl/server';

import { getPublicJobFilters, getPublicJobs } from '@/actions/careers/careers-actions';

import JobList from '@/components/ui/careers/JobList';
import JobPagination from '@/components/ui/careers/JobPagination';

import { Link, type AnyHref } from '@/i18n/navigation';

import '@/styles/04-components/careers/careersBase.scss';

/** Ofertas por página, las mismas que el buscador. */
const JOBS_PER_PAGE = 12;

/**
 * Props de {@link CityJobsViewPage}.
 * @interface CityJobsViewPageProps
 * @property {string} city - Slug de la ciudad
 * @property {string} locale - Idioma de la página
 * @property {Record<string, string | string[] | undefined>} searchParams - Paginación
 */
interface CityJobsViewPageProps {
    city: string;
    locale: string;
    searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Ofertas de una ciudad (`/empleo/ciudades/[ciudad]`).
 *
 * Existe además del filtro `?citySlug=` a propósito: **esta es la página indexable**. Tiene su propio `h1`,
 * su texto de entrada y su enlace a la página de servicios del municipio, y es la que puede posicionar por
 * «trabajo en Getafe». El filtro es la herramienta interactiva y va `noindex` (ver el `generateMetadata` de la
 * ruta).
 *
 * **Sin ofertas responde 404**, no una página que diga «no hay nada»: una página de ciudad vacía es contenido
 * de relleno que además promete algo que no hay, y no debe estar en el índice.
 * @param {CityJobsViewPageProps} props - Ciudad, idioma y paginación
 * @returns {Promise<JSX.Element>} La página de ciudad renderizada
 */
export default async function CityJobsViewPage({
    city,
    locale,
    searchParams,
}: CityJobsViewPageProps) {
    const t = await getTranslations({ locale, namespace: 'Careers.cities' });

    const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;

    const [jobsResponse, filtersResponse] = await Promise.all([
        getPublicJobs({ locale, page, limit: JOBS_PER_PAGE, citySlug: [city] }),
        getPublicJobFilters(locale),
    ]);

    const jobs = jobsResponse.data?.items ?? [];
    if (jobs.length === 0) notFound();

    const facet = filtersResponse.data?.cities.find((entry) => entry.slug === city);
    const cityName = facet?.name ?? jobs[0]?.locations.find((entry) => entry.slug === city)?.name ?? city;

    // La zona de servicios se saca de la propia oferta: es el `zoneSlug` que la intranet dejó en la ciudad.
    const zoneSlug = jobs
        .flatMap((job) => job.locations)
        .find((location) => location.slug === city)?.zoneSlug;

    return (
        <main className="careers">
            <section className="careers__hero">
                <div className="careers__container">
                    <h1 className="careers__hero-title">{t('pageTitle', { city: cityName })}</h1>
                    <p className="careers__hero-subtitle">
                        {t('pageSubtitle', {
                            city: cityName,
                            count: jobsResponse.data?.pagination.totalItems ?? jobs.length,
                        })}
                    </p>

                    <div className="careers__hero-links">
                        {zoneSlug && (
                            <Link href={`/zones/${zoneSlug}` as AnyHref}>
                                {t('seeServices', { city: cityName })}
                            </Link>
                        )}
                        <Link href="/careers">{t('backToAll')}</Link>
                    </div>
                </div>
            </section>

            <section className="careers__section">
                <div className="careers__container">
                    <JobList jobs={jobs} />

                    <JobPagination
                        currentPage={page}
                        totalPages={jobsResponse.data?.pagination.totalPages ?? 1}
                        citySlug={city}
                    />
                </div>
            </section>
        </main>
    );
}
