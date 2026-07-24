import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutHero.scss';

/**
 * Hero de la página "Sobre nosotros": titular, subtítulo, llamada a la
 * acción hacia contacto y una imagen destacada con el mismo marco en dos
 * capas que el hero de la home.
 * @returns {JSX.Element} El hero de About renderizado
 */
export default function AboutHero() {
  const t = useTranslations('About.hero');

  return (
    <section className="about__hero">
      <div className="about__container about__hero-grid">
        <div className="about__hero-copy">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h1 className="about__hero-title">{t('title')}</h1>
          <p className="about__hero-subtitle">{t('subtitle')}</p>

          <Link href="/contact" className="about__btn about__btn--accent">
            {t('cta')}
          </Link>
        </div>

        <div className="about__hero-media">
          <div className="about__hero-media-frame">
            <Image
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80"
              alt={t('imageAlt')}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="about__hero-image"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
