import {
    getPublicJobFilters,
    getPublicJobLocations,
    getPublicJobs,
} from '@/actions/careers/careers-actions';

import CareersHero from '@/components/ui/careers/CareersHero';
import JobApplySection from '@/components/ui/careers/JobApplySection';
import JobCityLinks from '@/components/ui/careers/JobCityLinks';
import JobEmptyState from '@/components/ui/careers/JobEmptyState';
import JobFilters from '@/components/ui/careers/JobFilters';
import JobList from '@/components/ui/careers/JobList';
import JobPagination from '@/components/ui/careers/JobPagination';
import JobSearchBar from '@/components/ui/careers/JobSearchBar';

import '@/styles/04-components/careers/careersBase.scss';

/** Ofertas por página. Doce entran en una cuadrícula de tres columnas sin dejar huecos. */
const JOBS_PER_PAGE = 12;

/** Claves de la query que son filtros de contenido, para saber si hay alguno activo. */
const FILTER_KEYS = [
    'citySlug',
    'categorySlug',
    'contractSlug',
    'workMode',
    'experience',
    'salaryMin',
    'search',
];

/**
 * Props de {@link CareersViewPage}.
 * @interface CareersViewPageProps
 * @property {string} locale - Idioma de la página
 * @property {Record<string, string | string[] | undefined>} searchParams - Filtros y paginación de la URL
 */
interface CareersViewPageProps {
    locale: string;
    searchParams: Record<string, string | string[] | undefined>;
}

/** Devuelve un parámetro de query como cadena, tomando el primero si viene repetido. */
function firstOf(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

/** Devuelve un parámetro de query como lista, admitiendo que venga una sola vez. */
function listOf(value: string | string[] | undefined): string[] | undefined {
    if (!value) return undefined;
    return Array.isArray(value) ? value : [value];
}

/**
 * Buscador de empleo (`/empleo`).
 *
 * Server Component, como el listado del blog y por el mismo motivo: **el resultado se pinta ya filtrado en el
 * HTML**, sin un salto visible ni un esqueleto, y es indexable desde la primera respuesta. Los filtros viven
 * en la URL, así que son compartibles y sobreviven al botón de atrás.
 *
 * Con `?spontaneous=true` la página enseña el formulario de candidatura espontánea en vez del listado: es la
 * salida del estado vacío, y así no hace falta otra ruta para algo que es el mismo formulario sin oferta.
 * @param {CareersViewPageProps} props - Idioma y query params
 * @returns {Promise<JSX.Element>} El buscador renderizado
 */
export default async function CareersViewPage({ locale, searchParams }: CareersViewPageProps) {
    const page = Number(firstOf(searchParams.page)) > 0 ? Number(firstOf(searchParams.page)) : 1;
    const isSpontaneous = firstOf(searchParams.spontaneous) === 'true';

    /*
     * El selector de ciudad del formulario sale del **catálogo** (`getPublicJobLocations`), no de las
     * facetas del buscador, y solo se pide cuando el formulario se va a pintar —de ahí el `undefined`.
     *
     * Con las facetas, la candidatura espontánea que se abre desde el estado vacío —«ahora mismo no hay
     * ofertas abiertas, déjanos tu candidatura»— llegaba con la lista vacía: el desplegable no se abría al
     * pulsarlo, porque no había ni una opción que enseñar.
     */
    const [jobsResponse, filtersResponse, locationsResponse] = await Promise.all([
        getPublicJobs({
            locale,
            page,
            limit: JOBS_PER_PAGE,
            citySlug: listOf(searchParams.citySlug),
            categorySlug: firstOf(searchParams.categorySlug),
            contractSlug: firstOf(searchParams.contractSlug),
            workMode: firstOf(searchParams.workMode) as JobWorkMode | undefined,
            experience: firstOf(searchParams.experience) as JobExperienceLevel | undefined,
            salaryMin: firstOf(searchParams.salaryMin),
            search: firstOf(searchParams.search),
            sort: firstOf(searchParams.sort) === 'salary' ? 'salary' : 'recent',
        }),
        getPublicJobFilters(locale),
        isSpontaneous ? getPublicJobLocations() : undefined,
    ]);

    const jobs = jobsResponse.data?.items ?? [];
    const pagination = jobsResponse.data?.pagination;
    const filters = filtersResponse.data ?? {
        cities: [],
        categories: [],
        contractTypes: [],
        workModes: [],
        experienceLevels: [],
        totalJobs: 0,
    };

    const activeFilters = Object.fromEntries(
        FILTER_KEYS.map((key) => [key, searchParams[key]]).filter(([, value]) => Boolean(value)),
    );
    const hasFilters = Object.keys(activeFilters).length > 0;

    const formCities = locationsResponse?.data ?? [];

    return (
        <main className="careers">
            <CareersHero totalJobs={filters.totalJobs} totalCities={filters.cities.length} />

            <section className="careers__section">
                <div className="careers__container">
                    {isSpontaneous ? (
                        <JobApplySection cities={formCities} requireTalentPool />
                    ) : (
                        <>
                            <JobSearchBar
                                cities={filters.cities}
                                activeSearch={firstOf(searchParams.search)}
                                activeCity={firstOf(searchParams.citySlug)}
                            />

                            <JobCityLinks cities={filters.cities} />

                            <JobFilters
                                filters={filters}
                                activeFilters={activeFilters}
                                resultCount={pagination?.totalItems ?? 0}
                            />

                            {jobs.length > 0 ? (
                                <>
                                    <JobList jobs={jobs} />

                                    <JobPagination
                                        currentPage={page}
                                        totalPages={pagination?.totalPages ?? 1}
                                        searchParams={searchParams}
                                    />
                                </>
                            ) : (
                                <JobEmptyState hasFilters={hasFilters} />
                            )}
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
