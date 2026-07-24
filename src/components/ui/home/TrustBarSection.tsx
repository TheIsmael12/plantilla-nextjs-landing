import Image from 'next/image';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/trustBarSection.scss';

const CERTS = ['iso-9001', 'iso-14001', 'iso-45001', 'iso-27001'] as const;

/**
 * Cinta de confianza justo debajo del hero: tres datos concretos ya
 * enunciados en el resto de la home (atención 24/365, respuesta en 48h,
 * sustituciones sin coste) y las certificaciones ISO de la empresa, para
 * dar credibilidad inmediata antes de pedir nada al visitante.
 * @returns {JSX.Element} La cinta de confianza renderizada
 */
export default function TrustBarSection() {
  const t = useTranslations('Home.trustBar');

  const stats = ['availability', 'response', 'coverage'] as const;

  return (
    <section className="home__trust-bar" aria-label={t('ariaLabel')}>
      <div className="home__container home__trust-bar-grid">
        <dl className="home__trust-bar-stats">
          {stats.map((stat) => (
            <div className="home__trust-bar-stat" key={stat}>
              <dt>{t(`items.${stat}.value`)}</dt>
              <dd>{t(`items.${stat}.label`)}</dd>
            </div>
          ))}
        </dl>

        <div className="home__trust-bar-certs">
          <p className="home__trust-bar-certs-label">{t('items.certifications.label')}</p>
          <ul className="home__trust-bar-certs-list">
            {CERTS.map((cert) => (
              <li key={cert}>
                <Image
                  src={`/images/assets/certs/${cert}.png`}
                  alt={cert.toUpperCase()}
                  width={44}
                  height={56}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
