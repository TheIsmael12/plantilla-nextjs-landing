import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle2, ClipboardCheck, PhoneCall } from 'lucide-react';

import { ENV } from '@/config/env';

import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/homeCtaPrimary.scss';

const PILLS = ['pillA', 'pillB', 'pillC'] as const;

/**
 * Banda de llamada a la acción de cierre de la home: invita a solicitar
 * presupuesto, enumera en pastillas lo que incluye y ofrece la llamada
 * directa como alternativa para quien prefiera no rellenar un formulario.
 * @returns {JSX.Element} La sección de CTA de cierre renderizada
 */
export default function HomeCtaPrimary() {
  const t = useTranslations('Home.ctaPrimary');

  return (
    <section className="home__cta">
      <div className="home__container home__cta-grid">

        <div className="home__cta-copy">
          <p className="home__eyebrow">{t('eyebrow')}</p>
          <h2 className="home__title-lg">{t('title')}</h2>
          <p className="home__text-muted">{t('subtitle')}</p>

          <ul className="home__cta-pills" aria-label={t('pillsLabel')}>
            {PILLS.map((pill) => (
              <li key={pill} className="home__cta-pill">
                <CheckCircle2 aria-hidden="true" />
                {t(pill)}
              </li>
            ))}
          </ul>
        </div>

        <div className="home__cta-action">
          <div className="home__cta-card">
            <span className="home__cta-icon">
              <ClipboardCheck size={22} />
            </span>
            <p className="home__cta-card-label">{t('cardLabel')}</p>

            <Link href="/contact" className="home__btn home__btn--accent home__cta-button">
              {t('button')}
            </Link>

            <div className="home__cta-divider">
              <span>{t('orLabel')}</span>
            </div>

            <a href={`tel:${ENV.COMPANY_PHONE}`} className="home__cta-call">
              <PhoneCall aria-hidden="true" />
              <span>
                {t('callCta')} <strong>{ENV.COMPANY_PHONE}</strong>
              </span>
            </a>
          </div>

          <p className="home__cta-aside">{t('aside')}</p>
        </div>

      </div>
    </section>
  );
}
