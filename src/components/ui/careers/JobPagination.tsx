import { useTranslations } from 'next-intl';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Link, type AnyHref } from '@/i18n/navigation';

import '@/styles/04-components/careers/careersBase.scss';

const PAGE_WINDOW_SIZE = 5;

/** Ventana de números de página a mostrar, centrada en la actual. */
function getPageWindow(current: number, total: number, size: number): number[] {
    if (total <= size) return Array.from({ length: total }, (_, index) => index + 1);

    let start = Math.max(1, current - Math.floor(size / 2));
    let end = start + size - 1;

    if (end > total) {
        end = total;
        start = end - size + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Construye el href de una página, preservando los filtros activos.
 *
 * Sirve para el buscador y para las páginas de ciudad: si viene `citySlug`, la paginación se queda dentro de
 * la página de ciudad en vez de mandar al buscador con un filtro puesto, que es otra URL con otro
 * `canonical`.
 * @param {number} page - Página destino
 * @param {Record<string, string | string[] | undefined>} [searchParams] - Filtros a preservar
 * @param {string} [citySlug] - Ciudad, si la paginación es de una página de ciudad
 * @returns {AnyHref} El href listo para `<Link>`
 */
function buildPageHref(
    page: number,
    searchParams?: Record<string, string | string[] | undefined>,
    citySlug?: string,
) {
    const query: Record<string, string | string[]> = {};

    for (const [key, value] of Object.entries(searchParams ?? {})) {
        if (!value) continue;
        if (key === 'page') continue;
        query[key] = value;
    }

    if (page > 1) query.page = String(page);

    /*
     * Se devuelve el objeto `href` de next-intl en vez de una cadena ya montada: la ruta de empleo está
     * traducida (`/empleo`), y una cadena con la query pegada detrás deja de coincidir con ninguna entrada
     * de `config/pathnames.ts`, así que se serviría sin traducir — un 404 en español.
     */
    return citySlug
        ? ({ pathname: '/careers/cities/[city]', params: { city: citySlug }, query } as AnyHref)
        : ({ pathname: '/careers', query } as AnyHref);
}

/**
 * Paginación del listado de empleo: **enlaces reales**, no botones.
 *
 * Es la única forma de que un buscador recorra las páginas siguientes, y de que quien no tenga JavaScript
 * pueda pasar de página.
 * @param {JobPaginationProps} props - Propiedades del componente
 * @returns {JSX.Element | null} La paginación, o `null` si solo hay una página
 */
export default function JobPagination({
    currentPage,
    totalPages,
    searchParams,
    citySlug,
}: JobPaginationProps) {
    const t = useTranslations('Blog.pagination');

    if (totalPages <= 1) return null;

    const canPrevious = currentPage > 1;
    const canNext = currentPage < totalPages;

    return (
        <nav className="careers__pagination" aria-label={t('currentPage', { page: currentPage })}>
            {canPrevious ? (
                <Link
                    href={buildPageHref(currentPage - 1, searchParams, citySlug)}
                    className="careers__pagination-arrow"
                    aria-label={t('previous')}
                >
                    <ChevronLeftIcon size={18} aria-hidden="true" />
                </Link>
            ) : (
                <span
                    className="careers__pagination-arrow careers__pagination-arrow--disabled"
                    aria-hidden="true"
                >
                    <ChevronLeftIcon size={18} />
                </span>
            )}

            {getPageWindow(currentPage, totalPages, PAGE_WINDOW_SIZE).map((page) => (
                <Link
                    key={page}
                    href={buildPageHref(page, searchParams, citySlug)}
                    className={`careers__pagination-page${
                        page === currentPage ? ' careers__pagination-page--active' : ''
                    }`}
                    aria-label={t('goToPage', { page })}
                    aria-current={page === currentPage ? 'page' : undefined}
                >
                    {page}
                </Link>
            ))}

            {canNext ? (
                <Link
                    href={buildPageHref(currentPage + 1, searchParams, citySlug)}
                    className="careers__pagination-arrow"
                    aria-label={t('next')}
                >
                    <ChevronRightIcon size={18} aria-hidden="true" />
                </Link>
            ) : (
                <span
                    className="careers__pagination-arrow careers__pagination-arrow--disabled"
                    aria-hidden="true"
                >
                    <ChevronRightIcon size={18} />
                </span>
            )}
        </nav>
    );
}
