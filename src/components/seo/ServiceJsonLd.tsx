import { getTranslations } from 'next-intl/server';

import { ENV } from '@/config/env';
import { getPathname, type AnyHref } from '@/i18n/navigation';
import type { ServiceSlug } from '@/config/routing';
import { ZONES } from '@/config/zones';

interface ServiceJsonLdProps {
  slug: ServiceSlug;
  locale: string;
}

/**
 * Datos estructurados (JSON-LD) `Service` propio de cada ficha de servicio — complementa (no
 * sustituye) el `Offer`/`Service` que ya emite `OrganizationJsonLd.tsx` dentro de `makesOffer`:
 * ese es un listado plano sin `@id` propio, útil para el catálogo de la empresa en conjunto,
 * pero no da a cada página de servicio una entidad `Service` identificada con su propia URL,
 * que es lo que un buscador asocia directamente con esa página concreta. Mismo criterio que
 * `ZoneJsonLd.tsx` para las páginas de zona (auditoría SEO externa, punto 15).
 *
 * Las zonas vienen de `config/zones.ts` (las 20 reales), no de `About.cta.zones` — esa clave de
 * traducción se quitó al pasar `AboutCta.tsx` a derivar la cobertura de la misma fuente, y este
 * componente se quedó apuntando a una key inexistente (`MISSING_MESSAGE`, 500 real en
 * producción en las 6 páginas de servicio). Misma fuente que `OrganizationJsonLd.tsx`.
 * @param {ServiceJsonLdProps} props - El slug del servicio y el locale actual
 * @returns {Promise<JSX.Element>} El `<script type="application/ld+json">` con el marcado del servicio
 */
export default async function ServiceJsonLd({ slug, locale }: ServiceJsonLdProps) {
  const t = await getTranslations({ locale, namespace: 'Services.items' });
  const metaT = await getTranslations({ locale, namespace: 'Metadata' });

  const baseUrl = ENV.APP_URL.replace(/\/$/, '');
  const servicePath = getPathname({ href: `/services/${slug}` as AnyHref, locale });
  const zones = ZONES.map((zone) => zone.name);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: metaT(`routes./services/${slug}.title`),
    provider: { '@id': `${baseUrl}/#organization` },
    areaServed: zones.map((zone) => ({ '@type': 'City', name: zone })),
    description: t(`${slug}.summary`),
    url: `${baseUrl}${servicePath}`,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
