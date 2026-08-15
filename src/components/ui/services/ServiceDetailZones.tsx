'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';

import { Link, useRouter, type AnyHref } from '@/i18n/navigation';
import { ZONES } from '@/config/zones';
import type { ServiceSlug } from '@/config/routing';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailZones.scss';

/*
 * El lienzo se carga solo en el navegador: Leaflet toca `window` al importarse, y `'use
 * client'` no evita el render en servidor (marca dónde empieza el cliente, pero Next pinta
 * esos componentes igual para mandar el primer HTML). Mismo arreglo que
 * `components/ui/maps/LocationMap.tsx` ya aplica para su propio mapa.
 */
const ServiceDetailZonesCanvas = dynamic(
  () => import('@/components/ui/services/ServiceDetailZonesCanvas'),
  { ssr: false },
);

/** Las primeras 6 de `ZONES`: las 3 confirmadas desde el origen + el Nivel 1 completo
 *  (`requisitos-seo.md` §4) — el orden del array ya refleja esa prioridad, mismo criterio que
 *  usa `sitemap.ts` para las prioridades de rastreo. Mostrar las 20 en cada una de las 6
 *  fichas de servicio sería ruido visual y diluiría el valor de cada enlace; el resto queda a
 *  un clic en `/zonas` (el índice, `ZonesIndexViewPage.tsx`). */
const FEATURED_ZONES = ZONES.slice(0, 6);

interface ServiceDetailZonesProps {
  slug: ServiceSlug;
}

/**
 * Zonas de cobertura desde la ficha de un servicio, como mapa real (Leaflet + CARTO Dark
 * Matter sin etiquetas: solo calles, sin nombres de comercios) — el enlazado interno que
 * faltaba en la dirección servicio→zona (auditoría #2, `requisitos-seo.md` §14): ya existía
 * zona→servicio (`ZoneServices.tsx`) pero no al revés.
 *
 * Antes era una lista de chips en fila y, en un segundo intento, un SVG esquemático propio —
 * ninguno de los dos convenció al usuario ("sigue feo", "mete el Leaflet con el modo dark").
 * Con un mapa real, cada zona queda en su ubicación geográfica exacta sin depender de una
 * proyección manual propensa a que las zonas cercanas entre sí (toda la corona noroeste) se
 * amontonen o se solapen sus etiquetas.
 * @param {ServiceDetailZonesProps} props - El slug del servicio actual, para el título
 * @returns {JSX.Element} El mapa de zonas destacadas, más el enlace al índice completo
 */
export default function ServiceDetailZones({ slug }: ServiceDetailZonesProps) {
  const t = useTranslations('Services.detail');
  const itemsT = useTranslations('Services.items');
  const zonesT = useTranslations('Zones.items');
  const router = useRouter();

  const zoneNames = Object.fromEntries(
    FEATURED_ZONES.map((zone) => [zone.slug, zonesT(`${zone.slug}.name`)]),
  );

  return (
    <section className="services__zones">
      <div className="services__container">
        <h2 className="services__title-lg services__zones-title">
          {t('zonesTitle', { service: itemsT(`${slug}.title`) })}
        </h2>

        <div className="services__zones-layout">
          <ServiceDetailZonesCanvas
            zones={FEATURED_ZONES}
            zoneNames={zoneNames}
            onZoneSelect={(zoneSlug) => router.push(`/zones/${zoneSlug}` as AnyHref)}
            ariaLabel={t('zonesTitle', { service: itemsT(`${slug}.title`) })}
          />

          <ul className="services__zones-list">
            {FEATURED_ZONES.map((zone) => (
              <li key={zone.slug}>
                <Link href={`/zones/${zone.slug}` as AnyHref} className="services__zones-link">
                  <span className="services__zones-link-name">{zonesT(`${zone.slug}.name`)}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link href={'/zones' as AnyHref} className="services__zones-all-link">
          {t('zonesViewAll')} <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
