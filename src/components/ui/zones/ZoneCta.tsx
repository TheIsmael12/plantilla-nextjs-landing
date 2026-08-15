import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import type { ZoneSlug } from '@/config/zones';

import '@/styles/04-components/about/aboutBase.scss';

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
      <div className="about__container">
        <p className="about__eyebrow">{tZones('hero.eyebrow')}</p>
        <h2 className="about__title-lg">{tZones('ctaTitle', { zone: zoneName })}</h2>
        <p className="about__text-muted">{tZones('ctaSubtitle')}</p>

        <Link href="/contact" className="about__btn about__btn--accent">
          {tZones('ctaButton')}
        </Link>
      </div>
    </section>
  );
}
