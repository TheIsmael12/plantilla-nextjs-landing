import { Link, type AnyHref } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';

import { ZONES, type MetropolitanArea } from '@/config/zones';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/zones/zonesIndex.scss';

const AREA_ORDER: MetropolitanArea[] = ['capital', 'noroeste', 'norte', 'sur', 'este'];

/**
 * Índice de las 20 páginas de zona, agrupadas por corona metropolitana — encontrado en
 * auditoría (2026-08-15): sin esta página, `/zonas` (quitar el último segmento de la URL de
 * cualquier zona) daba 404, y no había ningún sitio del sitio que las listara todas juntas.
 *
 * Agrupa por corona (`ZONES[].area`) en vez de una lista plana de 20: más fácil de escanear
 * para quien busca su municipio, y refuerza la relación entre zonas cercanas que ya establece
 * `ZoneNearby.tsx` dentro de cada página individual.
 * @returns {JSX.Element} El índice de zonas renderizado
 */
export default function ZonesIndexGrid() {
  const t = useTranslations('Zones');
  const itemsT = useTranslations('Zones.items');
  const areaLabelsT = useTranslations('Zones.areaGroups');

  return (
    <section className="about__approach">
      <div className="about__container">
        {AREA_ORDER.map((area) => {
          const zonesInArea = ZONES.filter((zone) => zone.area === area);
          if (zonesInArea.length === 0) return null;

          return (
            <div className="zones-index__group" key={area}>
              <h2 className="about__title-lg zones-index__group-title">{areaLabelsT(area)}</h2>
              <ul className="zones-index__list">
                {zonesInArea.map((zone) => (
                  <li key={zone.slug}>
                    <Link href={`/zones/${zone.slug}` as AnyHref} className="zones-index__link">
                      <MapPin size={14} aria-hidden="true" />
                      {itemsT(`${zone.slug}.name`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <p className="about__text-muted zones-index__note">{t('indexNote')}</p>
      </div>
    </section>
  );
}
