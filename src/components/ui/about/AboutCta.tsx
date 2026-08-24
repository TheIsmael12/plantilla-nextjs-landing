import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Clock, MapPin } from 'lucide-react';

import { ENV } from '@/config/env';
import { ZONES, type MetropolitanArea } from '@/config/zones';
import { COMPANY_ADDRESS_SHORT } from '@/utils/companyAddressUtils';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutCta.scss';

/** Mismo orden capital → coronas que usa `/zones` (`ZonesIndexViewPage.tsx`). */
const AREA_ORDER: MetropolitanArea[] = ['capital', 'noroeste', 'norte', 'sur', 'este'];

/**
 * Banda de cierre de About: zonas de cobertura, horario y sede de la
 * empresa, junto a la llamada a la acción hacia el formulario de
 * presupuesto.
 *
 * Las zonas se derivan de `config/zones.ts` (las 20 reales, agrupadas por corona metropolitana
 * con las mismas etiquetas que `/zones`, `Zones.areaGroups`) en vez de una lista fija de 3
 * municipios que llevaba tiempo desactualizada frente al resto del sitio — con 20 zonas reales
 * ya publicadas, mostrar solo 3 aquí subestimaba la cobertura real de la empresa. Se agrupa por
 * corona (con el número de municipios de cada una) y se enlaza a `/zones` para el listado
 * completo, en vez de repetir los 20 nombres en una columna estrecha.
 * @returns {JSX.Element} La sección de cierre renderizada
 */
export default function AboutCta() {
  const t = useTranslations('About.cta');
  const tZones = useTranslations('Zones');

  const areaCounts = AREA_ORDER.map((area) => ({
    area,
    label: tZones(`areaGroups.${area}`),
    count: ZONES.filter((zone) => zone.area === area).length,
  }));

  return (
    <section className="about__cta">
      <div className="about__container about__cta-grid">
        <div className="about__cta-copy">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>

          <p className="about__cta-zones-label">{t('zonesLabel', { count: ZONES.length })}</p>
          <ul className="about__cta-zones">
            {areaCounts.map(({ area, label, count }) => (
              <li key={area}>
                {label} <span className="about__cta-zones-count">{count}</span>
              </li>
            ))}
          </ul>
          <Link href="/zones" className="about__cta-zones-note about__cta-zones-link">
            {t('zonesNote')}
          </Link>
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
                {COMPANY_ADDRESS_SHORT}
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
