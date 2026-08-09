import { useTranslations } from 'next-intl';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Link, resolveHref } from '@/i18n/navigation';

import '@/styles/04-components/blog/blogPagination.scss';

const PAGE_WINDOW_SIZE = 5;

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
 * Construye el href de una página del listado de blog, preservando el resto
 * de filtros activos (p. ej. `category`) como query params.
 * @param {number} page - Número de página destino
 * @param {Record<string, string | undefined>} [searchParams] - Filtros activos a preservar
 * @returns {ReturnType<typeof resolveHref>} El href listo para `<Link>`
 */
function buildPageHref(page: number, searchParams?: Record<string, string | undefined>) {
  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) query[key] = value;
  }

  if (page > 1) query.page = String(page);

  return resolveHref({ pathname: '/blog' }, query);
}

/**
 * Paginación del listado de blog: enlaces reales (navegables sin JS,
 * indexables) prev/next + ventana de páginas centrada en la actual.
 * @param {BlogPaginationProps} props - Propiedades del componente
 * @returns {JSX.Element | null} La paginación renderizada, o `null` si solo hay una página
 */
export default function BlogPagination({
  currentPage,
  totalPages,
  searchParams,
}: BlogPaginationProps) {
  const t = useTranslations('Blog.pagination');

  if (totalPages <= 1) return null;

  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <nav className="blog__pagination" aria-label={t('currentPage', { page: currentPage })}>
      {canPrevious ? (
        <Link
          href={buildPageHref(currentPage - 1, searchParams)}
          className="blog__pagination-arrow"
          aria-label={t('previous')}
        >
          <ChevronLeftIcon size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span className="blog__pagination-arrow blog__pagination-arrow--disabled" aria-hidden="true">
          <ChevronLeftIcon size={18} />
        </span>
      )}

      {getPageWindow(currentPage, totalPages, PAGE_WINDOW_SIZE).map((page) => (
        <Link
          key={page}
          href={buildPageHref(page, searchParams)}
          className={`blog__pagination-page${page === currentPage ? ' blog__pagination-page--active' : ''}`}
          aria-label={t('goToPage', { page })}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}

      {canNext ? (
        <Link
          href={buildPageHref(currentPage + 1, searchParams)}
          className="blog__pagination-arrow"
          aria-label={t('next')}
        >
          <ChevronRightIcon size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span className="blog__pagination-arrow blog__pagination-arrow--disabled" aria-hidden="true">
          <ChevronRightIcon size={18} />
        </span>
      )}
    </nav>
  );
}
