import { notFound, redirect } from 'next/navigation';

import { getTranslations } from 'next-intl/server';

import { getPublicJob, getPublicJobFilters, getPublicJobs } from '@/actions/careers/careers-actions';

import JobPostingJsonLd from '@/components/seo/JobPostingJsonLd';
import JobApplySection from '@/components/ui/careers/JobApplySection';
import JobDetailBody from '@/components/ui/careers/JobDetailBody';
import JobDetailHeader from '@/components/ui/careers/JobDetailHeader';
import JobList from '@/components/ui/careers/JobList';

import { getPathname, Link, type AnyHref } from '@/i18n/navigation';

import { HTTPStatus } from '@/constants/httpStatus';

import '@/styles/04-components/careers/careersBase.scss';
import '@/styles/04-components/careers/careersDetail.scss';

/** Cuántas ofertas parecidas se enseñan al final de la ficha. Tres entran en una fila y no compiten con la oferta que se está leyendo. */
const RELATED_LIMIT = 3;

/**
 * Ofertas parecidas a la que se está leyendo: primero de la misma familia profesional y, si no hay ninguna
 * más, de la misma ciudad. Es el criterio de un buscador de empleo, y el que hace que una oferta que no
 * encaja no deje a la persona en un callejón sin salida.
 *
 * Se pide una más de las que se enseñan porque **la propia oferta viene en el resultado** y hay que quitarla.
 * @param {PublicJobDetail} job - La oferta que se está viendo
 * @param {string} locale - Idioma
 * @returns {Promise<PublicJobListItem[]>} Hasta {@link RELATED_LIMIT} ofertas, sin la actual
 */
async function findRelatedJobs(job: PublicJobDetail, locale: string): Promise<PublicJobListItem[]> {
    const exceptThisOne = (items: PublicJobListItem[]) =>
        items.filter((item) => item.slug !== job.slug).slice(0, RELATED_LIMIT);

    const byCategory = await getPublicJobs({
        locale,
        page: 1,
        limit: RELATED_LIMIT + 1,
        categorySlug: job.categorySlug,
    });

    const related = exceptThisOne(byCategory.data?.items ?? []);
    if (related.length > 0) return related;

    const citySlug = job.locations[0]?.slug;
    if (!citySlug) return [];

    const byCity = await getPublicJobs({
        locale,
        page: 1,
        limit: RELATED_LIMIT + 1,
        citySlug: [citySlug],
    });

    return exceptThisOne(byCity.data?.items ?? []);
}

/**
 * Props de {@link JobDetailViewPage}.
 * @interface JobDetailViewPageProps
 * @property {string} slug - Slug de la oferta
 * @property {string} locale - Idioma de la página
 */
interface JobDetailViewPageProps {
    slug: string;
    locale: string;
}

/**
 * Ficha de una oferta (`/empleo/[slug]`).
 *
 * Trata los tres finales posibles como tres cosas distintas, que es lo que hace la diferencia para quien
 * llega desde Google o desde un enlace compartido:
 *
 * - **La oferta existe**: se pinta, con sus datos estructurados.
 * - **Existe en el otro idioma** (`404` con `correctSlug`): se **redirige** a la misma oferta en ese idioma,
 *   en vez de enseñar un error a alguien que solo cambió de idioma.
 * - **Ya se cerró** (`410`): se explica que el proceso terminó y se enlaza al buscador. Un 404 aquí dejaría
 *   la URL como error en Search Console y a la persona sin saber qué pasó.
 * @param {JobDetailViewPageProps} props - Slug e idioma
 * @returns {Promise<JSX.Element>} La ficha renderizada
 */
export default async function JobDetailViewPage({ slug, locale }: JobDetailViewPageProps) {
    const t = await getTranslations({ locale, namespace: 'Careers.detail' });

    const [response, filtersResponse] = await Promise.all([
        getPublicJob(slug, locale),
        getPublicJobFilters(locale),
    ]);

    if (!response.data) {
        // `correctSlug` viaja como *extension member* del problema RFC 9457, y `parseError` lo deja en
        // `extensions` (ver `utils/fetchUtils.ts`).
        const correctSlug = response.extensions?.correctSlug;

        if (response.status === HTTPStatus.NOT_FOUND && typeof correctSlug === 'string') {
            redirect(
                getPathname({
                    // Pathname canónico y slug por separado, o next-intl no traduce el segmento estático y
                    // la redirección acabaría en `/careers/...` dentro del sitio en español.
                    href: { pathname: '/careers/[slug]', params: { slug: correctSlug } } as AnyHref,
                    locale,
                }),
            );
        }

        if (response.status === HTTPStatus.GONE) {
            return (
                <main className="careers">
                    <section className="careers__section">
                        <div className="careers__container careers__closed">
                            <h1>{t('closedTitle')}</h1>
                            <p>{t('closedText')}</p>
                            <Link href="/careers" className="careers__button">
                                {t('apply')}
                            </Link>
                        </div>
                    </section>
                </main>
            );
        }

        notFound();
    }

    const job = response.data;
    const cities = filtersResponse.data?.cities ?? [];

    // Va después de resolver la oferta porque el criterio sale de ella (su familia profesional): no se puede
    // pedir en paralelo con la ficha.
    const relatedJobs = await findRelatedJobs(job, locale);

    return (
        <main className="careers">
            <JobPostingJsonLd job={job} locale={locale} />

            <JobDetailHeader job={job} />

            <section className="careers__section">
                <div className="careers__container careers__detail-layout">
                    <JobDetailBody job={job} />

                    {/*
                      El formulario solo se pinta si de verdad se puede presentar alguien: con la oferta en
                      pausa o con candidatura externa, enseñarlo sería invitar a rellenar algo que la API va a
                      rechazar con un 409.
                    */}
                    {job.acceptingApplications && !job.applyUrl && (
                        <JobApplySection jobCode={job.jobCode} cities={cities} />
                    )}
                </div>
            </section>

            {relatedJobs.length > 0 && (
                <section className="careers__section careers__related">
                    <div className="careers__container">
                        <h2 className="careers__related-title">{t('relatedTitle')}</h2>
                        <JobList jobs={relatedJobs} />
                    </div>
                </section>
            )}
        </main>
    );
}
