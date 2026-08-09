import { useTranslations } from 'next-intl';

import '@/styles/04-components/blog/blogPostToc.scss';

/**
 * Tabla de contenidos de un post, generada a partir de sus encabezados
 * Markdown. Solo se muestra si hay más de un encabezado (un post corto sin
 * subtítulos no necesita índice). Versión estática, sin resaltado del
 * encabezado activo al hacer scroll.
 * @param {BlogTocProps} props - Propiedades del componente
 * @returns {JSX.Element | null} La tabla de contenidos, o `null` si no aporta valor
 */
export default function BlogPostToc({ headings }: BlogTocProps) {
  const t = useTranslations('Blog.detail');

  if (headings.length <= 1) return null;

  return (
    <nav className="blog__toc" aria-label={t('tocTitle')}>
      <p className="blog__toc-title">{t('tocTitle')}</p>
      <ol>
        {headings.map((heading) => (
          <li key={heading.anchor} className={`blog__toc-item blog__toc-item--level-${heading.level}`}>
            <a href={`#${heading.anchor}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
