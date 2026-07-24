import Image from 'next/image';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/futureVideoSection.scss';

/**
 * Sección de vídeo institucional de la home: tarjeta con imagen de portada,
 * botón de reproducción y un breve texto de presentación del equipo.
 * @returns {JSX.Element} La sección de vídeo renderizada
 */
export default function FutureVideoSection() {
  const t = useTranslations('Home.video');

  return (
    <section className="home__video">
      <div className="home__container home__video-grid">
        <div className="home__video-card">
          <Image
            src="/images/home/video-cover.jpg"
            alt={t('imageAlt')}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="home__video-image"
          />
          <button className="home__play" type="button" aria-label={t('playLabel')}>
            <span />
          </button>
          <p className="home__video-caption">{t('caption')}</p>
        </div>

        <div>
          <h2 className="home__title-lg">{t('title')}</h2>
          <p className="home__text-muted">{t('descriptionA')}</p>
          <p className="home__text-muted">{t('descriptionB')}</p>
        </div>
      </div>
    </section>
  );
}

