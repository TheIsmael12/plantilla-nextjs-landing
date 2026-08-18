import { useTranslations } from 'next-intl';
import { Building2, Briefcase, Store } from 'lucide-react';

import type { ServiceSlug } from '@/config/routing';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutValues.scss';

const AUDIENCES = [
  { key: 'communities', Icon: Building2 },
  { key: 'propertyManagers', Icon: Briefcase },
  { key: 'businesses', Icon: Store },
] as const;

interface ServiceDetailAudienceProps {
  slug: ServiceSlug;
}

/**
 * Cómo cambia este servicio concreto según quién lo contrata (comunidad de propietarios,
 * administrador de fincas gestionando varias fincas, o empresa/centro comercial) — hasta ahora
 * ninguna ficha de servicio explicaba esta diferencia, con el mismo texto sirviendo por igual
 * para los tres perfiles. Cada bloque es específico del servicio (no una plantilla que solo
 * cambia el nombre del cliente), reutilizando el patrón `about__values-grid` ya usado en
 * `ZoneServices.tsx`/`WhoWeHelpSection.tsx`/`PropertyManagersServices.tsx`.
 * @param {ServiceDetailAudienceProps} props - El slug del servicio a mostrar
 * @returns {JSX.Element} La sección de tipos de cliente renderizada
 */
export default function ServiceDetailAudience({ slug }: ServiceDetailAudienceProps) {
  const t = useTranslations(`Services.items.${slug}.audience`);
  const tShared = useTranslations('Services.detail');

  return (
    <section className="about__values">
      <div className="about__container">
        <div className="about__values-header">
          <p className="about__eyebrow">{tShared('audienceEyebrow')}</p>
          <h2 className="about__title-lg">{tShared('audienceTitle')}</h2>
        </div>

        <ul className="about__values-grid">
          {AUDIENCES.map(({ key, Icon }) => (
            <li className="about__value-card" key={key}>
              <span className="about__value-icon">
                <Icon size={22} />
              </span>
              <h3>{t(`${key}.title`)}</h3>
              <p>{t(`${key}.description`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
