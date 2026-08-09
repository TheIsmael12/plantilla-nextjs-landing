import Image from 'next/image';
import { useTranslations } from 'next-intl';

import '@/styles/04-components/blog/blogBase.scss';
import '@/styles/04-components/blog/blogHero.scss';

/**
 * Hero del listado de blog: eyebrow, titular y subtítulo que presentan la
 * sección al visitante, con el mismo decorado que `ServicesHero`.
 * @returns {JSX.Element} El hero del blog renderizado
 */
export default function BlogHero() {
  const t = useTranslations('Blog.hero');

  return (
    <section className="blog__hero">
      <Image
        src="/images/assets/decor/shape.svg"
        alt=""
        width={190}
        height={190}
        className="blog__hero-decor"
      />
      <div className="blog__container blog__hero-inner">
        <p className="blog__eyebrow">{t('eyebrow')}</p>
        <h1 className="blog__title-lg">{t('title')}</h1>
        <p className="blog__text-muted">{t('subtitle')}</p>
      </div>
    </section>
  );
}
