import { Link, type AnyHref } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { ZONES } from '@/config/zones';
import SpainMapLazy from '@/components/ui/home/SpainMapLazy';

import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/expansionMapSection.scss';

/**
 * Sección de cobertura geográfica de la home: enlaza a las 20 páginas de zona reales
 * (`config/zones.ts`, requisitos-seo.md §4), junto al mapa de España ({@link SpainMap}) con
 * la Comunidad de Madrid iluminada en el color de marca.
 *
 * Antes listaba los municipios como `<li>` de texto plano, leídos de `Home.expansion.zones`
 * (una copia desincronizada con solo 3 zonas, las mismas que `About.cta.zones`) — sin enlace
 * a ninguna parte. Con 20 páginas de zona ya publicadas, esta era la sección con más
 * potencial de enlazado interno de todo el sitio y no enlazaba a ninguna: la corrige leyendo
 * directamente de `ZONES` (única fuente de verdad) en vez de una lista de traducción aparte,
 * así que no puede volver a desincronizarse si se añade o quita una zona del catálogo.
 * @returns {JSX.Element} La sección de cobertura renderizada
 */
export default function ExpansionMapSection() {
  const t = useTranslations('Home.expansion');
  const zonesT = useTranslations('Zones.items');

  return (
    <section className="home__expansion">
      <div className="home__container home__expansion-grid">
        <div>
          <h2 className="home__title-lg">{t('title')}</h2>
          <p className="home__text-muted">{t('description')}</p>

          <p className="home__expansion-zones-label">{t('zonesLabel')}</p>
          <ul className="home__expansion-zones">
            {ZONES.map((zone) => (
              <li key={zone.slug}>
                <Link href={`/zones/${zone.slug}` as AnyHref}>{zonesT(`${zone.slug}.name`)}</Link>
              </li>
            ))}
          </ul>

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
