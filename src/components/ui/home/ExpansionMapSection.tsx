import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import SpainMapLazy from '@/components/ui/home/SpainMapLazy';

import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/expansionMapSection.scss';

/**
 * Sección de cobertura geográfica de la home: describe las zonas atendidas
 * como una lista real de municipios, junto al mapa de España
 * ({@link SpainMap}) con la Comunidad de Madrid iluminada en el color de
 * marca.
 * @returns {JSX.Element} La sección de cobertura renderizada
 */
export default function ExpansionMapSection() {
  const t = useTranslations('Home.expansion');
  const zones = t.raw('zones') as string[];

  return (
    <section className="home__expansion">
      <div className="home__container home__expansion-grid">
        <div>
          <h2 className="home__title-lg">{t('title')}</h2>
          <p className="home__text-muted">{t('description')}</p>

          <p className="home__expansion-zones-label">{t('zonesLabel')}</p>
          <ul className="home__expansion-zones">
            {zones.map((zone) => (
              <li key={zone}>{zone}</li>
            ))}
          </ul>
          <p className="home__expansion-zones-note">{t('zonesNote')}</p>

          <Link href="/about" className="home__btn home__btn--light">
            {t('cta')}
          </Link>
        </div>

        <div className="home__spain-map-frame">
          <SpainMapLazy />
        </div>
      </div>
    </section>
  );
}
