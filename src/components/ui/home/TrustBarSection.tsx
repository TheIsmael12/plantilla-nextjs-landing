import { useTranslations } from 'next-intl';
import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/trustBarSection.scss';

/**
 * Cinta de confianza justo debajo del hero: tres datos concretos ya
 * enunciados en el resto de la home (atención 24/365, respuesta en 48h,
 * sustituciones sin coste), para dar credibilidad inmediata antes de pedir
 * nada al visitante.
 *
 * Las certificaciones ISO 9001/14001/45001/27001 que se mostraban aquí
 * (`Home.trustBar.items.certifications`) eran placeholder, no reales
 * (`requisitos-seo.md` §1) — quitadas hasta que la empresa las obtenga de
 * verdad, junto con el bloque equivalente de `AboutCertifications.tsx`.
 * @returns {JSX.Element} La cinta de confianza renderizada
 */
export default function TrustBarSection() {
  const t = useTranslations('Home.trustBar');

  const stats = ['availability', 'response', 'coverage'] as const;

  return (
    <section className="home__trust-bar" aria-label={t('ariaLabel')}>
      <div className="home__container home__trust-bar-grid home__trust-bar-grid--stats-only">
        <dl className="home__trust-bar-stats">
          {stats.map((stat) => (
            <div className="home__trust-bar-stat" key={stat}>
              <dt>{t(`items.${stat}.value`)}</dt>
              <dd>{t(`items.${stat}.label`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
