import type { Metadata } from 'next';

import { ENV } from '@/config/env';
import { getPathname, type AnyHref } from '@/i18n/navigation';
import CareersViewPage from '@/views/(public)/careers/CareersViewPage';

interface CareersPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Parámetros de query que convierten la página en una vista filtrada y no en el buscador. */
const FILTER_PARAMS = [
    'citySlug',
    'categorySlug',
    'contractSlug',
    'workMode',
    'experience',
    'salaryMin',
    'search',
    'sort',
    'page',
    'spontaneous',
];

/**
 * Metadatos del buscador de empleo.
 *
 * El título y la descripción los pone el layout (`Metadata.routes./careers`); esta función solo decide lo
 * único que depende de la query, y es lo que evita el problema clásico de un buscador con filtros en la URL:
 * **cada combinación es una URL distinta con el mismo contenido**. Todas van `noindex, follow` — `follow`
 * para que las ofertas enlazadas sí se rastreen — y el canónico apunta a la versión sin filtros.
 *
 * La excepción es el filtro de ciudad: ahí el canónico apunta a `/empleo/ciudades/<ciudad>`, que es la página
 * pensada para posicionar por «trabajo en X» y la que tiene contenido propio.
 * @param {CareersPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<Metadata>} Solo `robots` y `alternates`; el resto se hereda del layout
 */
export async function generateMetadata({
    params,
    searchParams,
}: CareersPageProps): Promise<Metadata> {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;

    const hasFilters = FILTER_PARAMS.some((key) => Boolean(resolvedSearchParams[key]));
    if (!hasFilters) return {};

    // Solo cuenta como «una ciudad» si es el único filtro y viene una sola vez: con otro filtro encima el
    // contenido ya no es el de la página de ciudad, y apuntar el canónico ahí sería declarar duplicado algo
    // que no lo es.
    const citySlug = resolvedSearchParams.citySlug;
    const otherFilters = FILTER_PARAMS.filter((key) => key !== 'citySlug');
    const isCityOnly =
        typeof citySlug === 'string' && !otherFilters.some((key) => Boolean(resolvedSearchParams[key]));

    // El pathname canónico y la ciudad van por separado: con la ruta montada como una cadena, next-intl no
    // traduce el segmento estático y el canónico apuntaría a `/careers/...` dentro del sitio en español.
    const canonicalHref = (
        isCityOnly ? { pathname: '/careers/cities/[city]', params: { city: citySlug } } : '/careers'
    ) as AnyHref;

    return {
        robots: 'noindex, follow',
        alternates: {
            canonical: `${ENV.APP_URL.replace(/\/$/, '')}${getPathname({ href: canonicalHref, locale })}`,
        },
    };
}

/**
 * Buscador de empleo público. Reenvía `params`/`searchParams` porque el filtrado ocurre en el Server
 * Component, igual que el listado del blog (ver {@link CareersViewPage}).
 * @param {CareersPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} El buscador renderizado
 */
export default async function CareersPage({ params, searchParams }: CareersPageProps) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;

    return <CareersViewPage locale={locale} searchParams={resolvedSearchParams} />;
}
