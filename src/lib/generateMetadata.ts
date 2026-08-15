import { Metadata } from "next";
import { headers } from "next/headers";

import { getPathname, type AnyHref } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { ENV } from "@/config/env";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@/config/locales";
import type { StaticPathname } from "@/types/route";
import { isAuthPathname, isPrivateRoute } from "@/utils/routingUtils";

/**
 * Genera los metadatos (`generateMetadata` de `[locale]/layout.tsx`) a partir
 * de las traducciones `Metadata.routes.<ruta>` / `Metadata.default`: lee la
 * ruta canónica del header `x-canonical-pathname` (inyectado por
 * {@link import('@/proxy').default}) para encontrar el título/descripción/
 * keywords de la página activa, y construye las URLs canónica/alternates
 * para cada idioma soportado además de los bloques OpenGraph y Twitter card.
 * Se centraliza aquí para no repetir esta lógica de SEO en cada página.
 * @param {{ locale: string }} params El locale actual (de los `params` de `[locale]/layout.tsx`)
 * @returns {Promise<Metadata>} Metadatos completos de la página actual (title, description, keywords, OpenGraph, Twitter card, canonical/alternates)
 */
export async function generateTranslatedMetadata({
  locale,
}: {
  locale: string;
}): Promise<Metadata> {
  const headersList = await headers();
  const canonicalPathname = (headersList.get("x-canonical-pathname") ||
    "/") as StaticPathname;

  const t = await getTranslations({ locale, namespace: "Metadata" });

  const routeKey = `routes.${canonicalPathname}`;
  const hasRouteMetadata = t.has(`${routeKey}.title`);

  const title = hasRouteMetadata ? t(`${routeKey}.title`) : t("default.title");
  const description = hasRouteMetadata
    ? t(`${routeKey}.description`)
    : t("default.description");
  const keywords = hasRouteMetadata
    ? t(`${routeKey}.keywords`)
    : t("default.keywords");

  const fullTitle = `${title} | ${ENV.APP_NAME}`;

  const baseUrl = ENV.APP_URL.replace(/\/$/, "");

  // Rutas dinámicas (`canonicalPathname` con segmentos `[param]`, p. ej.
  // `/blog/[id]`): `getPathname` exige los route params, así que de momento
  // no se traducen aquí (no hay ninguna publicada todavía); cuando exista
  // una página así, debe generar sus propios metadatos con `generateMetadata`.
  const isDynamicRoute = canonicalPathname.includes("[");

  const canonicalPath = isDynamicRoute
    ? canonicalPathname
    : getPathname({ href: canonicalPathname as AnyHref, locale });
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  const languages = SUPPORTED_LOCALES.reduce<Record<string, string>>(
    (acc, l) => {
      const localizedPath = isDynamicRoute
        ? canonicalPathname
        : getPathname({ href: canonicalPathname as AnyHref, locale: l });
      acc[l] = `${baseUrl}${localizedPath}`;
      return acc;
    },
    {},
  );

  // Páginas de autenticación y área de cliente: no aportan contenido único
  // que valga la pena indexar (y la segunda, además, requiere sesión), así
  // que se marcan `noindex` aunque el resto del sitio sí sea público
  // (ver `robots.ts`, que permite el rastreo general).
  const shouldNoIndex =
    isAuthPathname(canonicalPathname) || isPrivateRoute(canonicalPathname);

  const ogImage = { url: ENV.OG_IMAGE, width: 1200, height: 630 };

  return {
    title: fullTitle,
    description,
    keywords,
    robots: shouldNoIndex ? "noindex, nofollow" : "index, follow",
    publisher: ENV.APP_NAME,
    applicationName: ENV.APP_NAME,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    creator: ENV.APP_NAME,
    authors: [{ name: ENV.APP_NAME, url: ENV.APP_URL }],
    icons: {
      icon: "/icon.png",
      shortcut: "/favicon.ico",
      apple: "/icon.png",
    },
    // Solo se emite si hay un código real en el .env: sin esto, Search
    // Console no puede verificar la propiedad por meta tag.
    ...(ENV.GOOGLE_SITE_VERIFICATION && {
      verification: { google: ENV.GOOGLE_SITE_VERIFICATION },
    }),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        // `x-default` debe apuntar a la misma URL en todas las páginas del
        // clúster de idiomas (no a la del locale actual), o los buscadores
        // detectan la inconsistencia entre páginas y descartan el canonical.
        "x-default": languages[DEFAULT_LOCALE],
        ...languages,
      },
      types: {
        "application/rss+xml": `${baseUrl}/feed.xml`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      type: "website",
      locale: locale as AppLocale,
      siteName: ENV.APP_NAME,
      images: [
        {
          url: `${baseUrl}${ogImage.url}`,
          secureUrl: `${baseUrl}${ogImage.url}`,
          width: ogImage.width,
          height: ogImage.height,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${baseUrl}${ogImage.url}`],
    },
  };
}
