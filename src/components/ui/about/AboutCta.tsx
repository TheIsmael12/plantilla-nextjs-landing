import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Clock, MapPin } from 'lucide-react';

import { ENV } from '@/config/env';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutCta.scss';

/**
 * Banda de cierre de About: zonas de cobertura, horario y sede de la
 * empresa, junto a la llamada a la acción hacia el formulario de
 * presupuesto.
 * @returns {JSX.Element} La sección de cierre renderizada
 */
export default function AboutCta() {
  const t = useTranslations('About.cta');
  const zones = t.raw('zones') as string[];

  return (
    <section className="about__cta">
      <div className="about__container about__cta-grid">
        <div className="about__cta-copy">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>

          <p className="about__cta-zones-label">{t('zonesLabel')}</p>
          <ul className="about__cta-zones">
            {zones.map((zone) => (
              <li key={zone}>{zone}</li>
            ))}
          </ul>
          <p className="about__cta-zones-note">{t('zonesNote')}</p>
        </div>

        <div className="about__cta-info">
          <div className="about__cta-fact">
            <Clock aria-hidden="true" />
            <div>
              <p className="about__cta-fact-label">{t('scheduleLabel')}</p>
              <p className="about__cta-fact-value">{ENV.COMPANY_SCHEDULE}</p>
            </div>
          </div>

          <div className="about__cta-fact">
            <MapPin aria-hidden="true" />
            <div>
              <p className="about__cta-fact-label">{t('addressLabel')}</p>
              <p className="about__cta-fact-value">
                {ENV.COMPANY_ADDRESS}, {ENV.COMPANY_CITY}
              </p>
            </div>
          </div>

          <Link href="/contact" className="about__btn about__btn--accent">
            {t('button')}
          </Link>
        </div>
      </div>
    </section>
  );
}
