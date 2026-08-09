'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';

import '@/styles/04-components/blog/blogFilters.scss';

/**
 * Pastillas de filtro por categoría y tag del listado de blog: navega a
 * `/blog` con el query param correspondiente (`category`/`tag`) actualizado
 * o eliminado, preservando el resto de la query string y sin añadir
 * entradas al historial. La página siempre vuelve a la 1 al cambiar de
 * filtro. Categoría y tag son independientes (el backend admite ambos a la
 * vez en `GET /blog/posts`), así que cambiar uno no borra el otro.
 * @param {BlogFiltersProps} props - Propiedades del componente
 * @returns {JSX.Element | null} Las pastillas de filtro, o `null` si no hay categorías ni tags
 */
export default function BlogFilters({ categories, tags, activeCategory, activeTag }: BlogFiltersProps) {
  const t = useTranslations('Blog.filters');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  if (categories.length === 0 && tags.length === 0) return null;

  const navigateWithParam = (key: 'category' | 'tag', value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const query = params.toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- `pathname` ya viene tipado por next-intl; solo se añade la query string.
    router.replace((query ? `${pathname}?${query}` : pathname) as any, { scroll: false });
  };

  return (
    <div className="blog__filters-group">
      {categories.length > 0 && (
        <div className="blog__filters" role="group" aria-label={t('categoryLabel')}>
          <button
            type="button"
            className={`blog__filters-pill${!activeCategory ? ' blog__filters-pill--active' : ''}`}
            aria-pressed={!activeCategory}
            onClick={() => navigateWithParam('category', undefined)}
          >
            {t('allCategories')}
          </button>

          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              className={`blog__filters-pill${activeCategory === category.slug ? ' blog__filters-pill--active' : ''}`}
              aria-pressed={activeCategory === category.slug}
              onClick={() => navigateWithParam('category', category.slug)}
            >
              {category.name}
              <span className="blog__filters-pill-count">{category.postCount}</span>
            </button>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="blog__filters blog__filters--tags" role="group" aria-label={t('tagLabel')}>
          {tags.map((tag) => (
            <button
              key={tag.slug}
              type="button"
              className={`blog__filters-tag${activeTag === tag.slug ? ' blog__filters-tag--active' : ''}`}
              aria-pressed={activeTag === tag.slug}
              onClick={() => navigateWithParam('tag', activeTag === tag.slug ? undefined : tag.slug)}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
