import { getTranslations } from 'next-intl/server';

import { ENV } from '@/config/env';
import { ZONES } from '@/config/zones';
import { getPathname, type AnyHref } from '@/i18n/navigation';

interface ZonesIndexJsonLdProps {
  locale: string;
}

/**
 * Datos estructurados (JSON-LD) `CollectionPage`/`ItemList` del índice de zonas — le dice a
 * Google explícitamente que esta página es un listado de 20 entidades (`Place`), en vez de
 * dejar que lo infiera solo del HTML. Añadido en auditoría #3 (`requisitos-seo.md` §14): el
 * índice ya funcionaba y enlazaba bien, pero no llevaba ningún schema propio más allá del
 * `LocalBusiness`/`WebSite` genérico de todas las páginas.
 * @param {ZonesIndexJsonLdProps} props - El locale actual, para resolver nombres y URLs traducidas
 * @returns {Promise<JSX.Element>} El `<script type="application/ld+json">` con el listado de zonas
 */
export default async function ZonesIndexJsonLd({ locale }: ZonesIndexJsonLdProps) {
  const t = await getTranslations({ locale, namespace: 'Zones.items' });
  const indexT = await getTranslations({ locale, namespace: 'Zones.index' });
  const baseUrl = ENV.APP_URL.replace(/\/$/, '');
  const indexPath = getPathname({ href: '/zones' as AnyHref, locale });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: indexT('title'),
    url: `${baseUrl}${indexPath}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ZONES.map((zone, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Place',
          name: t(`${zone.slug}.name`),
          url: `${baseUrl}${getPathname({ href: `/zones/${zone.slug}` as AnyHref, locale })}`,
          geo: {
            '@type': 'GeoCoordinates',
            latitude: zone.latitude,
            longitude: zone.longitude,
          },
        },
      })),
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
