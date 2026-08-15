import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { getPathname, type AnyHref } from '@/i18n/navigation';
import { ENV } from '@/config/env';
import type { StaticPathname } from '@/types/route';

interface BreadcrumbJsonLdProps {
  locale: string;
}

/**
 * Nombre corto de un tramo de la ruta canónica, para el texto del breadcrumb.
 *
 * Se prueba primero `Routes.<tramo>` (namespace del navbar/footer públicos, `i18n/locales/*\/navigation.json`):
 * cubre las páginas de primer nivel (`/services`, `/about`, `/contact`...) con una etiqueta corta pensada para
 * un menú, que es justo lo que necesita un breadcrumb y no el título largo de SEO. Para los tramos que no
 * están ahí —las páginas de servicio individuales, que cuelgan de `/services`— se cae a
 * `Metadata.routes.<tramo>.title`, que si existe. Devuelve `null` si ninguno de los dos tiene esa clave: mejor
 * omitir un tramo que enseñar la ruta técnica (`/services/cleaning`) como si fuera el texto pensado para
 * humanos.
 * @param {(key: string) => string} tRoutes - `useTranslations('Routes')`
 * @param {(key: string) => boolean} tRoutesHas - `tRoutes.has`
 * @param {(key: string) => string} tMetadata - `useTranslations('Metadata')`
 * @param {(key: string) => boolean} tMetadataHas - `tMetadata.has`
 * @param {string} pathname - Tramo de ruta canónica a resolver (p. ej. `/services/cleaning`)
 * @returns {string | null} La etiqueta corta, o `null` si no hay traducción para ese tramo
 */
function resolveCrumbName(
  tRoutes: (key: string) => string,
  tRoutesHas: (key: string) => boolean,
  tMetadata: (key: string) => string,
  tMetadataHas: (key: string) => boolean,
  pathname: string,
): string | null {
  if (tRoutesHas(pathname)) return tRoutes(pathname);

  const metadataKey = `routes.${pathname}.title`;
  if (tMetadataHas(metadataKey)) return tMetadata(metadataKey);

  return null;
}

/**
 * Datos estructurados (JSON-LD) `BreadcrumbList` de la página pública activa: una entrada por cada
 * tramo de la ruta canónica que tenga un nombre traducido, desde Inicio hasta la página actual.
 *
 * Sigue el mismo patrón que {@link import('./OrganizationJsonLd').default}: lee la ruta canónica del
 * header `x-canonical-pathname` (el mismo que usa `generateMetadata.ts`, inyectado por `proxy.ts`), y
 * resuelve el nombre y la URL de cada tramo con las traducciones y `getPathname` ya existentes, sin
 * inventar un catálogo de textos propio.
 *
 * No se renderiza en la home (`/`): con un solo tramo (`Inicio`), un `BreadcrumbList` de un elemento no
 * aporta nada y algunas herramientas de validación lo marcan como redundante.
 * @param {BreadcrumbJsonLdProps} props - El locale actual, para resolver nombres y URLs traducidas
 * @returns {Promise<JSX.Element | null>} El `<script type="application/ld+json">` con el breadcrumb, o `null` en la home
 */
export default async function BreadcrumbJsonLd({ locale }: BreadcrumbJsonLdProps) {
  const headersList = await headers();
  const canonicalPathname = (headersList.get('x-canonical-pathname') || '/') as StaticPathname;

  if (canonicalPathname === '/' || canonicalPathname.includes('[')) return null;

  const tRoutes = await getTranslations({ locale, namespace: 'Routes' });
  const tMetadata = await getTranslations({ locale, namespace: 'Metadata' });

  const baseUrl = ENV.APP_URL.replace(/\/$/, '');

  // Cada segmento acumulado de la ruta: para `/services/cleaning` genera
  // `["/services", "/services/cleaning"]`, uno por nivel del breadcrumb.
  const segments = canonicalPathname.split('/').filter(Boolean);
  const cumulativePathnames = segments.map((_, index) => `/${segments.slice(0, index + 1).join('/')}`);

  const crumbs = [
    { name: resolveCrumbName(tRoutes, tRoutes.has, tMetadata, tMetadata.has, '/'), pathname: '/' as const },
    ...cumulativePathnames.map((pathname) => ({
      name: resolveCrumbName(tRoutes, tRoutes.has, tMetadata, tMetadata.has, pathname),
      pathname,
    })),
  ].filter((crumb): crumb is { name: string; pathname: string } => crumb.name !== null);

  // Con solo Inicio (ningún tramo intermedio tuvo traducción), no hay nada que enseñar como jerarquía.
  if (crumbs.length < 2) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${getPathname({ href: crumb.pathname as AnyHref, locale })}`,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
