import { Link, type AnyHref } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';

import { getNearbyZones } from '@/config/zones';
import type { ZoneSlug } from '@/config/zones';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/zones/zoneNearby.scss';

interface ZoneNearbyProps {
  slug: ZoneSlug;
}

/**
 * Zonas cercanas a la actual (misma corona metropolitana, `getNearbyZones`), con enlace a su
 * propia página — el enlazado interno entre zonas que pide `requisitos-seo.md` §4, y evita que
 * cada página de zona sea una isla sin conexión con el resto del catálogo de cobertura.
 *
 * No se renderiza si la zona no tiene vecinas en el catálogo (no debería pasar con las 20
 * actuales, pero es una guarda razonable si en el futuro se añade una zona aislada en su
 * propia corona).
 * @param {ZoneNearbyProps} props - El slug de la zona actual
 * @returns {JSX.Element | null} La lista de zonas cercanas, o `null` si no hay ninguna
 */
export default function ZoneNearby({ slug }: ZoneNearbyProps) {
  const t = useTranslations(`Zones.items.${slug}`);
  const tZones = useTranslations('Zones');
  const itemsT = useTranslations('Zones.items');
  const nearby = getNearbyZones(slug);

  if (nearby.length === 0) return null;

  return (
    <section className="about__approach">
      <div className="about__container">
        <h2 className="about__title-lg">{tZones('otherZonesTitle', { zone: t('name') })}</h2>

        <ul className="about__zone-nearby-list">
          {nearby.map((zone) => (
            <li key={zone.slug}>
              <Link href={`/zones/${zone.slug}` as AnyHref} className="about__zone-nearby-link">
                <MapPin size={14} aria-hidden="true" />
                {itemsT(`${zone.slug}.name`)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
