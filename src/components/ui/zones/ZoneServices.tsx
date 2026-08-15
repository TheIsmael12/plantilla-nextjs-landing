import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { SERVICE_SLUGS, SERVICE_ICONS } from '@/config/routing';
import type { ZoneSlug } from '@/config/zones';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutValues.scss';

interface ZoneServicesProps {
  slug: ZoneSlug;
}

/**
 * Los 6 servicios enlazados desde la página de zona, con el nombre del municipio en el
 * anchor text (`"Limpieza de comunidades en Alcobendas"`, no solo `"Limpieza"`) — el
 * enlazado interno bidireccional zona↔servicio que pide `requisitos-seo.md` §4.
 * @param {ZoneServicesProps} props - El slug de la zona a mostrar
 * @returns {JSX.Element} La cuadrícula de servicios enlazados renderizada
 */
export default function ZoneServices({ slug }: ZoneServicesProps) {
  const t = useTranslations(`Zones.items.${slug}`);
  const tZones = useTranslations('Zones');
  const itemsT = useTranslations('Services.items');
  const zoneName = t('name');

  return (
    <section className="about__values">
      <div className="about__container">
        <div className="about__values-header">
          <p className="about__eyebrow">{tZones('servicesEyebrow')}</p>
          <h2 className="about__title-lg">{tZones('servicesTitle', { zone: zoneName })}</h2>
        </div>

        <ul className="about__values-grid">
          {SERVICE_SLUGS.map((serviceSlug) => {
            const Icon = SERVICE_ICONS[serviceSlug];
            return (
              <li className="about__value-card" key={serviceSlug}>
                <span className="about__value-icon">
                  <Icon size={22} />
                </span>
                <h3>
                  <Link href={`/services/${serviceSlug}`}>
                    {itemsT(`${serviceSlug}.title`)} {tZones('inZone', { zone: zoneName })}
                  </Link>
                </h3>
                <p>{itemsT(`${serviceSlug}.summary`)}</p>
                <Link href={`/services/${serviceSlug}`} className="about__value-link">
                  {tZones('viewService')} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
