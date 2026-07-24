import { getTranslations } from 'next-intl/server';

import { getPathname, type AnyHref } from '@/i18n/navigation';
import { ENV } from '@/config/env';
import { SERVICE_SLUGS } from '@/config/routing';

interface OrganizationJsonLdProps {
  locale: string;
}

/**
 * Datos estructurados (JSON-LD) de la empresa: identidad, sede con
 * coordenadas `geo`, zonas de cobertura, horario y el catálogo de
 * servicios reales, en formato `LocalBusiness` de schema.org. Se renderiza
 * una sola vez en `[locale]/layout.tsx` para que esté presente en todas
 * las páginas públicas y refuerce las señales de negocio local (GEO/SEO)
 * de cara a buscadores y modelos de lenguaje.
 * @param {OrganizationJsonLdProps} props El locale actual, para generar URLs de servicio localizadas
 * @returns {Promise<JSX.Element>} El `<script type="application/ld+json">` con el marcado de la empresa
 */
export default async function OrganizationJsonLd({ locale }: OrganizationJsonLdProps) {
  const t = await getTranslations({ locale, namespace: 'About.cta' });
  const servicesT = await getTranslations({ locale, namespace: 'Services.items' });

  const baseUrl = ENV.APP_URL.replace(/\/$/, "");
  const zones = t.raw('zones') as string[];

  const socials = [
    ENV.SOCIAL_LINKEDIN,
    ENV.SOCIAL_INSTAGRAM,
    ENV.SOCIAL_TIKTOK,
    ENV.SOCIAL_TWITTER,
    ENV.SOCIAL_YOUTUBE,
    ENV.SOCIAL_FACEBOOK,
  ].filter((url): url is string => Boolean(url));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#organization`,
    name: ENV.APP_NAME,
    legalName: ENV.COMPANY_NAME,
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    image: `${baseUrl}${ENV.OG_IMAGE}`,
    telephone: ENV.COMPANY_PHONE,
    email: ENV.COMPANY_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ENV.COMPANY_ADDRESS,
      addressLocality: ENV.COMPANY_CITY,
      postalCode: ENV.COMPANY_POSTAL_CODE,
      addressRegion: ENV.COMPANY_STATE,
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: ENV.COMPANY_LATITUDE,
      longitude: ENV.COMPANY_LONGITUDE,
    },
    areaServed: zones.map((zone) => ({ '@type': 'City', name: zone })),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    ...(socials.length > 0 ? { sameAs: socials } : {}),
    makesOffer: SERVICE_SLUGS.map((slug) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: servicesT(`${slug}.title`),
        description: servicesT(`${slug}.summary`),
        areaServed: zones,
        url: `${baseUrl}${getPathname({ href: `/services/${slug}` as AnyHref, locale })}`,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
