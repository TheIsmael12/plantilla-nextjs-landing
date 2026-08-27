import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import type { ZoneSlug } from '@/config/zones';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutCta.scss';

interface ZoneCtaProps {
  slug: ZoneSlug;
}

/**
 * Banda de cierre de una página de zona: llamada a la acción hacia `/contact`, con el nombre
 * del municipio en el título — mismo criterio que `PropertyManagersCta.tsx` de no repetir
 * dirección/teléfono de urgencias mientras sigan siendo valores de fallback pendientes de
 * sustituir por los reales (`requisitos-seo.md` §1).
 * @param {ZoneCtaProps} props - El slug de la zona a mostrar
 * @returns {JSX.Element} La sección de cierre renderizada
 */
export default function ZoneCta({ slug }: ZoneCtaProps) {
  const t = useTranslations(`Zones.items.${slug}`);
  const tZones = useTranslations('Zones');
  const zoneName = t('name');

  return (
    <section className="about__cta">
      <div className="about__container about__cta-simple">
        <p className="about__eyebrow">{tZones('hero.eyebrow')}</p>
        <h2 className="about__title-lg">{tZones('ctaTitle', { zone: zoneName })}</h2>
        <p className="about__text-muted">{tZones('ctaSubtitle')}</p>

        <Link href="/contact" className="about__btn about__btn--accent">
          {tZones('ctaButton')}
        </Link>

        {/*
          El desvío para el administrador de fincas, que es el eslabón que faltaba del recorrido.
          Una página de zona la lee tanto un presidente de comunidad como quien gestiona veinte fincas en ese
          municipio, y hasta ahora los dos acababan en el mismo formulario. El segundo tiene su propia página —con
          la propuesta por cartera— y no había forma de llegar a ella desde aquí.
        */}
        <p className="about__cta-alt">
          {tZones('ctaManagersPrefix', { zone: zoneName })}{' '}
          <Link href="/for/property-managers" className="about__cta-alt-link">
            {tZones('ctaManagersLink')}
          </Link>
        </p>
      </div>
    </section>
  );
}
