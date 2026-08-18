import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Building2, Briefcase, Store } from 'lucide-react';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutValues.scss';

const SEGMENTS = [
  { key: 'communities', Icon: Building2, href: '/services' },
  { key: 'propertyManagers', Icon: Briefcase, href: '/for/property-managers' },
  { key: 'businesses', Icon: Store, href: '/services' },
] as const;

/**
 * "¿A quién ayudamos?": tres segmentos de cliente (comunidades de propietarios,
 * administradores de fincas, empresas y edificios), cada uno con su enlace propio — refuerza
 * la intención comercial de la home sin duplicar contenido de otra sección, reutilizando el
 * mismo patrón `about__values-grid` que `ZoneServices.tsx`/`PropertyManagersServices.tsx`.
 * Auditoría SEO externa (segunda pasada), punto 10.
 * @returns {JSX.Element} La sección de segmentos renderizada
 */
export default function WhoWeHelpSection() {
  const t = useTranslations('Home.whoWeHelp');

  return (
    <section className="about__values">
      <div className="about__container">
        <div className="about__values-header">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>
        </div>

        <ul className="about__values-grid">
          {SEGMENTS.map(({ key, Icon, href }) => (
            <li className="about__value-card" key={key}>
              <span className="about__value-icon">
                <Icon size={22} />
              </span>
              <h3>
                <Link href={href}>{t(`items.${key}.title`)}</Link>
              </h3>
              <p>{t(`items.${key}.description`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
