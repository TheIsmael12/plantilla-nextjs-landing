import { useTranslations } from 'next-intl';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Link, resolveHref } from '@/i18n/navigation';
import type { AnyHref } from '@/i18n/navigation';

import '@/styles/04-components/client-area/client-list.scss';

const PAGE_WINDOW_SIZE = 5;

interface ClientListPaginationProps {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
  params?: Record<string, string>;
  pageParamName?: string;
}

/** Calcula la ventana de números de página a mostrar, centrada en la página actual. */
function getPageWindow(current: number, total: number, size: number): number[] {
  if (total <= size) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(size / 2));
  let end = start + size - 1;

  if (end > total) {
    end = total;
    start = end - size + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Construye el href de una página del listado, preservando el resto de
 * filtros activos (p. ej. `status`) como query params.
 *
 * Cuando `basePath` lleva un segmento dinámico (p. ej.
 * `/private-area/communities/[serviceId]/units`) hay que entregarle a `<Link>`
 * el pathname canónico más sus `params` sin resolver: es lo único que permite a
 * next-intl traducir los segmentos estáticos de la ruta al locale activo. Con
 * el id ya sustituido a mano, el pathname no casaría con ninguna entrada de
 * `pathnames` y el enlace saldría sin localizar.
 * @param {string} basePath - Ruta canónica del listado (p. ej. `/private-area/quotes`)
 * @param {number} page - Número de página destino
 * @param {Record<string, string | undefined>} [searchParams] - Filtros activos a preservar
 * @param {Record<string, string>} [params] - Valores de los segmentos dinámicos de `basePath`
 * @param {string} [pageParamName] - Nombre del query param de página, para pantallas con dos tablas paginables
 * @returns {AnyHref} El href listo para `<Link>`
 */
function buildPageHref(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>,
  params?: Record<string, string>,
  pageParamName = 'page',
): AnyHref {
  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) query[key] = value;
  }

  if (page > 1) query[pageParamName] = String(page);

  if (params) {
    return { pathname: basePath, params, query };
  }

  return resolveHref({ pathname: basePath }, query);
}

/**
 * Paginación de los listados del portal de cliente: enlaces reales
 * (navegables sin JS) prev/next más una ventana de páginas centrada en la
 * actual. Adaptación de `BlogPagination` con la ruta base parametrizada,
 * porque aquí la usan tres listados distintos.
 * @param {ClientListPaginationProps} props - Propiedades del componente
 * @returns {JSX.Element | null} La paginación renderizada, o `null` si solo hay una página
 */
export default function ClientListPagination({
  basePath,
  currentPage,
  totalPages,
  searchParams,
  params,
  pageParamName,
}: ClientListPaginationProps) {
  const t = useTranslations('Common.Pagination');

  if (totalPages <= 1) return null;

  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <nav className="client-list__pagination" aria-label={t('currentPage', { page: currentPage })}>
      {canPrevious ? (
        <Link
          href={buildPageHref(basePath, currentPage - 1, searchParams, params, pageParamName)}
          className="client-list__pagination-arrow"
          aria-label={t('previous')}
        >
          <ChevronLeftIcon size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span className="client-list__pagination-arrow client-list__pagination-arrow--disabled" aria-hidden="true">
          <ChevronLeftIcon size={18} />
        </span>
      )}

      {getPageWindow(currentPage, totalPages, PAGE_WINDOW_SIZE).map((page) => (
        <Link
          key={page}
          href={buildPageHref(basePath, page, searchParams, params, pageParamName)}
          className={`client-list__pagination-page${page === currentPage ? ' client-list__pagination-page--active' : ''}`}
          aria-label={t('goToPage', { page })}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}

      {canNext ? (
        <Link
          href={buildPageHref(basePath, currentPage + 1, searchParams, params, pageParamName)}
          className="client-list__pagination-arrow"
          aria-label={t('next')}
        >
          <ChevronRightIcon size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span className="client-list__pagination-arrow client-list__pagination-arrow--disabled" aria-hidden="true">
          <ChevronRightIcon size={18} />
        </span>
      )}
    </nav>
  );
}
