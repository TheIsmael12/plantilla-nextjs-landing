import { getTranslations } from 'next-intl/server';

import { ENV } from '@/config/env';
import { getZoneBySlug, type ZoneSlug } from '@/config/zones';
import { getPathname, type AnyHref } from '@/i18n/navigation';

interface ZoneJsonLdProps {
  slug: ZoneSlug;
  locale: string;
}

/**
 * Datos estructurados (JSON-LD) `Service` con `areaServed` acotado a un municipio concreto —
 * complementa (no sustituye) el `LocalBusiness` con `areaServed` general que ya genera
 * `OrganizationJsonLd.tsx`, dándole a cada página de zona una señal explícita de qué servicio
 * se presta en qué lugar exacto, con las coordenadas reales del municipio (`config/zones.ts`).
 *
 * `name` reutiliza el `title` de `Metadata.routes["/zones/<slug>"]` (auditoría #3,
 * `requisitos-seo.md` §14) en vez de un texto propio: sin `name`, un `Service` es una entidad
 * sin nombrar para Google, más débil que uno identificado. Reutilizar el title ya redactado
 * (único por zona desde la corrección del metadata plantilla, misma auditoría) evita mantener
 * un tercer texto que decir lo mismo con otras palabras.
 * @param {ZoneJsonLdProps} props - El slug de la zona y el locale actual
 * @returns {Promise<JSX.Element | null>} El `<script type="application/ld+json">`, o `null` si el slug no existe
 */
export default async function ZoneJsonLd({ slug, locale }: ZoneJsonLdProps) {
  const zone = getZoneBySlug(slug);
  if (!zone) return null;

  const t = await getTranslations({ locale, namespace: `Zones.items.${slug}` });
  const metaT = await getTranslations({ locale, namespace: 'Metadata' });
  const baseUrl = ENV.APP_URL.replace(/\/$/, '');
  const zonePath = getPathname({ href: `/zones/${slug}` as AnyHref, locale });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: metaT(`routes./zones/${slug}.title`),
    provider: { '@id': `${baseUrl}/#organization` },
    areaServed: {
      '@type': 'City',
      name: zone.name,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: zone.latitude,
        longitude: zone.longitude,
      },
    },
    description: t('heroSubtitle'),
    url: `${baseUrl}${zonePath}`,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
