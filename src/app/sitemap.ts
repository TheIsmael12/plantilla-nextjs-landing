import type { MetadataRoute } from "next";

import { ENV } from "@/config/env";
import { DEFAULT_LOCALE } from "@/config/locales";
import { locales, pathnames } from "@/config/pathnames";
import type { StaticPathname } from "@/types/route";

const BASE_URL = ENV.APP_URL.replace(/\/$/, "");

// Rutas públicas realmente construidas (tienen `page.tsx`) y pensadas para
// indexarse. Las páginas de autenticación/área de cliente y las que todavía
// no existen (`/careers`, `/blog`) se dejan fuera a propósito.
const SITEMAP_ROUTES: { pathname: StaticPathname; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { pathname: "/", priority: 1, changeFrequency: "weekly" },
  { pathname: "/services", priority: 0.9, changeFrequency: "monthly" },
  { pathname: "/services/concierge", priority: 0.8, changeFrequency: "monthly" },
  { pathname: "/services/security", priority: 0.8, changeFrequency: "monthly" },
  { pathname: "/services/pools", priority: 0.8, changeFrequency: "monthly" },
  { pathname: "/services/cleaning", priority: 0.8, changeFrequency: "monthly" },
  { pathname: "/services/gardening", priority: 0.8, changeFrequency: "monthly" },
  { pathname: "/services/maintenance", priority: 0.8, changeFrequency: "monthly" },
  { pathname: "/about", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/help", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/help/faq", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/help/support", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { pathname: "/conditions", priority: 0.3, changeFrequency: "yearly" },
  { pathname: "/cookies-policy", priority: 0.3, changeFrequency: "yearly" },
  { pathname: "/complaints-channel", priority: 0.3, changeFrequency: "yearly" },
];

/**
 * Resuelve el pathname localizado de una ruta canónica para un idioma dado,
 * a partir de `config/pathnames.ts` (sin depender del contexto de petición
 * de `getPathname`, que no está disponible al generar el sitemap).
 * @param {StaticPathname} pathname - Ruta canónica (clave de `config/pathnames.ts`)
 * @param {(typeof locales)[number]} locale - Idioma al que resolver la ruta
 * @returns {string} La ruta localizada, sin el dominio
 */
function localizedPathFor(pathname: StaticPathname, locale: (typeof locales)[number]): string {
  const entry = pathnames[pathname as keyof typeof pathnames];
  const localized = typeof entry === "string" ? entry : entry[locale];
  // `localePrefix: "as-needed"` (`proxy.ts`/`i18n/routing.ts`): el locale por
  // defecto (`DEFAULT_LOCALE`) se sirve sin prefijo (`/`, `/servicios/...`);
  // el resto sí lo lleva (`/en`, `/en/services/...`).
  if (locale === DEFAULT_LOCALE) return localized;
  return localized === "/" ? `/${locale}` : `/${locale}${localized}`;
}

/**
 * Genera el sitemap del sitio: una entrada por cada ruta pública real y
 * cada idioma soportado, con las alternativas de idioma (`hreflang`)
 * enlazadas entre sí para que los buscadores no las traten como contenido
 * duplicado.
 * @returns {MetadataRoute.Sitemap} Las entradas del sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return SITEMAP_ROUTES.flatMap(({ pathname, priority, changeFrequency }) => {
    const languages = locales.reduce<Record<string, string>>((acc, locale) => {
      acc[locale] = `${BASE_URL}${localizedPathFor(pathname, locale)}`;
      return acc;
    }, {});

    return locales.map((locale) => ({
      url: `${BASE_URL}${localizedPathFor(pathname, locale)}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          // Mismo `x-default` fijo (el locale por defecto) que usa
          // `generateMetadata.ts`, para que ambas fuentes de hreflang
          // coincidan y los buscadores no descarten el canonical.
          "x-default": languages[DEFAULT_LOCALE],
          ...languages,
        },
      },
    }));
  });
}
