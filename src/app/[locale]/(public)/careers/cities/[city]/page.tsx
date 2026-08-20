import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import { getPublicJobFilters } from '@/actions/careers/careers-actions';
import { ENV } from '@/config/env';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/config/locales';
import { getPathname, type AnyHref } from '@/i18n/navigation';
import CityJobsViewPage from '@/views/(public)/careers/CityJobsViewPage';

interface CityJobsPageProps {
    params: Promise<{ locale: string; city: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Metadatos de la página de ciudad, con el nombre real del municipio en el título.
 *
 * El slug de la ciudad **no está traducido** (es el mismo en los dos idiomas, porque un municipio se llama
 * igual), así que los `hreflang` se construyen con `getPathname`: lo que cambia es el prefijo de la ruta
 * (`/empleo/ciudades` vs `/careers/cities`), no el último segmento.
 *
 * Si la ciudad no tiene ofertas se devuelve un objeto vacío: la vista responde 404 y unos metadatos
 * completos para una página que no existe solo servirían para que se compartiera bien un error.
 * @param {CityJobsPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<Metadata>} Metadatos de la ciudad, o un objeto vacío si no tiene ofertas
 */
export async function generateMetadata({ params }: CityJobsPageProps): Promise<Metadata> {
    const { locale, city } = await params;

    const filtersResponse = await getPublicJobFilters(locale);
    const facet = filtersResponse.data?.cities.find((entry) => entry.slug === city);

    if (!facet) return {};

    const t = await getTranslations({ locale, namespace: 'Careers.cities' });

    const baseUrl = ENV.APP_URL.replace(/\/$/, '');
    // Igual que en la ficha: el pathname canónico y la ciudad se pasan por separado, o next-intl deja la
    // ruta sin traducir y el canónico acabaría apuntando a `/careers/cities/...` en el sitio en español.
    const buildUrl = (target: string) =>
        `${baseUrl}${getPathname({
            href: { pathname: '/careers/cities/[city]', params: { city } } as AnyHref,
            locale: target,
        })}`;

    const languages = SUPPORTED_LOCALES.reduce<Record<string, string>>((acc, supported) => {
        acc[supported] = buildUrl(supported);
        return acc;
    }, {});

    const title = t('metaTitle', { city: facet.name });
    const fullTitle = `${title} | ${ENV.APP_NAME}`;
    const description = t('metaDescription', { city: facet.name, count: facet.count });

    return {
        title: fullTitle,
        description,
        robots: 'index, follow',
        alternates: {
            canonical: buildUrl(locale),
            languages: { 'x-default': languages[DEFAULT_LOCALE], ...languages },
        },
        openGraph: {
            title: fullTitle,
            description,
            url: buildUrl(locale),
            type: 'website',
            siteName: ENV.APP_NAME,
        },
    };
}

/**
 * Ofertas de empleo de una ciudad concreta.
 * @param {CityJobsPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La página de ciudad renderizada
 */
export default async function CityJobsPage({ params, searchParams }: CityJobsPageProps) {
    const { locale, city } = await params;
    const resolvedSearchParams = await searchParams;

    return <CityJobsViewPage city={city} locale={locale} searchParams={resolvedSearchParams} />;
}
