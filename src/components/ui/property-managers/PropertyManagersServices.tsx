import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { SERVICE_SLUGS, SERVICE_ICONS } from '@/config/routing';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutValues.scss';

/**
 * Los 6 servicios de Imora, enlazados desde la landing de administradores de fincas —
 * mismo patrón que `ZoneServices.tsx` (grid ligero, icono + título + resumen + enlace),
 * pero sin el nombre de una zona concreta en el anchor text: aquí la intención de búsqueda
 * es "un solo proveedor para toda mi cartera de comunidades", no una localidad.
 * @returns {JSX.Element} La cuadrícula de servicios renderizada
 */
export default function PropertyManagersServices() {
  const t = useTranslations('ForPropertyManagers.services');
  const itemsT = useTranslations('Services.items');

  return (
    <section className="about__values">
      <div className="about__container">
        <div className="about__values-header">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>
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
                  <Link href={`/services/${serviceSlug}`}>{itemsT(`${serviceSlug}.title`)}</Link>
                </h3>
                <p>{itemsT(`${serviceSlug}.summary`)}</p>
                <Link href={`/services/${serviceSlug}`} className="about__value-link">
                  {t('viewService')} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
