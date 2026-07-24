import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/heroNativeAds.scss';

/**
 * Hero principal de la home: titular, subtítulo, llamadas a la acción, una
 * imagen destacada con marco en dos capas y la tira de servicios más
 * solicitados a modo de directorio.
 * @returns {JSX.Element} El hero de la home renderizado
 */
export default function HeroNativeAds() {
  const t = useTranslations('Home.hero');

  const chips = ['conserjeria', 'seguridad', 'limpieza', 'jardineria', 'piscinas'] as const;

  return (
    <section className="home__hero">
      <div className="home__container home__hero-grid">
        <div className="home__hero-copy">
          <p className="home__eyebrow">{t('eyebrow')}</p>
          <h1 className="home__hero-title">{t('title')}</h1>
          <p className="home__hero-subtitle">{t('subtitle')}</p>

          <div className="home__hero-actions">
            <Link href="/contact" className="home__btn home__btn--accent">
              {t('primaryCta')}
            </Link>
            <Link href="/services" className="home__btn home__btn--ghost">
              {t('secondaryCta')}
            </Link>
          </div>

          <div className="home__hero-trust">
            <ShieldCheck aria-hidden="true" />
            <p>{t('trust')}</p>
          </div>
        </div>

        <div className="home__hero-media">
          <div className="home__hero-media-frame">
            <Image
              src="/images/home/hero.jpg"
              alt={t('imageAlt')}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="home__hero-image"
              priority
              fetchPriority="high"
            />
          </div>

          <ul className="home__chip-row" aria-label={t('chipsLabel')}>
            {chips.map((chip) => (
              <li className="home__chip" key={chip}>
                {t(`chips.${chip}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
