import Image from 'next/image';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutApproach.scss';

/**
 * Sección "Cómo trabajamos" de About: describe el equipo propio, el
 * departamento de inspección y el enfoque a medida de cada plan de
 * mantenimiento, junto a una imagen.
 * @returns {JSX.Element} La sección de enfoque de trabajo renderizada
 */
export default function AboutApproach() {
  const t = useTranslations('About.approach');

  return (
    <section className="about__approach">
      <div className="about__container about__approach-grid">
        <div className="about__approach-media">
          <Image
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
            alt={t('imageAlt')}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="about__approach-image"
          />
        </div>

        <div className="about__approach-copy">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>
          <p className="about__text-muted">{t('descriptionA')}</p>
          <p className="about__text-muted">{t('descriptionB')}</p>
          <p className="about__text-muted">{t('descriptionC')}</p>
        </div>
      </div>
    </section>
  );
}
