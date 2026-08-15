import type { MetadataRoute } from "next";

import { getBlogSitemapEntries } from "@/actions/blog/blog-actions";
import { ENV } from "@/config/env";
import { DEFAULT_LOCALE } from "@/config/locales";
import { locales, pathnames } from "@/config/pathnames";
import type { BlogSitemapEntry } from "@/types/blog/blog";
import type { StaticPathname } from "@/types/route";

const BASE_URL = ENV.APP_URL.replace(/\/$/, "");

// Rutas públicas realmente construidas (tienen `page.tsx`) y pensadas para
// indexarse. Las páginas de autenticación/área de cliente y las que todavía
// no existen (`/careers`) se dejan fuera a propósito. El listado de `/blog`
// sí entra aquí (contenido estático de la página); los posts individuales
// se añaden aparte, vía `buildBlogPostSitemapEntries` (contenido dinámico
// del backend, con su propio `lastModified` real por idioma).
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
  { pathname: "/for/property-managers", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/zones", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/zones/madrid", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/zones/pozuelo-de-alarcon", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/zones/alcorcon", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/zones/majadahonda", priority: 0.6, changeFrequency: "monthly" },
  { pathname: "/zones/las-rozas", priority: 0.6, changeFrequency: "monthly" },
  { pathname: "/zones/boadilla-del-monte", priority: 0.6, changeFrequency: "monthly" },
  { pathname: "/zones/alcobendas", priority: 0.6, changeFrequency: "monthly" },
  { pathname: "/zones/san-sebastian-de-los-reyes", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/zones/tres-cantos", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/zones/getafe", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/zones/leganes", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/zones/fuenlabrada", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/zones/mostoles", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/zones/torrejon-de-ardoz", priority: 0.4, changeFrequency: "monthly" },
  { pathname: "/zones/coslada", priority: 0.4, changeFrequency: "monthly" },
  { pathname: "/zones/rivas-vaciamadrid", priority: 0.4, changeFrequency: "monthly" },
  { pathname: "/zones/colmenar-viejo", priority: 0.4, changeFrequency: "monthly" },
  { pathname: "/zones/torrelodones", priority: 0.4, changeFrequency: "monthly" },
  { pathname: "/zones/collado-villalba", priority: 0.4, changeFrequency: "monthly" },
  { pathname: "/zones/arganda-del-rey", priority: 0.4, changeFrequency: "monthly" },
  { pathname: "/blog", priority: 0.7, changeFrequency: "daily" },
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
 * Recorre todas las páginas de `GET /blog/sitemap-entries` para un locale
 * (1000 entradas por página, fijado por el backend) y las acumula en un
 * único array. Si el backend no responde (no conectado, caído...), se
 * devuelve un array vacío en vez de romper la generación del resto del
 * sitemap — las rutas estáticas siguen siendo más importantes que el blog.
 * @param {(typeof locales)[number]} locale - Idioma a recorrer
 * @returns {Promise<BlogSitemapEntry[]>} Todas las entradas de ese idioma
 */
async function fetchAllBlogSitemapEntries(
  locale: (typeof locales)[number],
): Promise<BlogSitemapEntry[]> {
  const entries: BlogSitemapEntry[] = [];

  let page = 1;
  let totalPages = 1;

  do {
    const response = await getBlogSitemapEntries(locale, page);
    if (!response.data) break;

    entries.push(...response.data.items);
    totalPages = response.data.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);

  return entries;
}

/**
 * Construye las entradas del sitemap para los posts del blog, una por post
 * y locale disponible (`alternates` cruzados entre los locales en los que
 * ese post concreto está publicado, que pueden no ser todos los
 * `SUPPORTED_LOCALES` si aún no se tradujo a todos).
 * @returns {Promise<MetadataRoute.Sitemap>} Las entradas de posts del sitemap
 */
async function buildBlogPostSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const entriesByLocale = await Promise.all(
    locales.map(async (locale) => ({ locale, entries: await fetchAllBlogSitemapEntries(locale) })),
  );

  return entriesByLocale.flatMap(({ locale, entries }) =>
    entries.map((entry) => {
      const languages = entry.alternates.reduce<Record<string, string>>((acc, alt) => {
        acc[alt.locale] = `${BASE_URL}/${alt.locale}/blog/${alt.slug}`;
        return acc;
      }, {});

      // Locale por defecto sin prefijo, igual que el resto de rutas
      // (`localePrefix: "as-needed"`): si este post está publicado en ese
      // locale, su URL en `languages` debe perder el prefijo `/es`.
      if (languages[DEFAULT_LOCALE]) {
        languages[DEFAULT_LOCALE] = languages[DEFAULT_LOCALE].replace(`/${DEFAULT_LOCALE}/`, "/");
      }

      const url =
        locale === DEFAULT_LOCALE
          ? `${BASE_URL}/blog/${entry.slug}`
          : `${BASE_URL}/${locale}/blog/${entry.slug}`;

      return {
        url,
        lastModified: new Date(entry.lastmod),
        changeFrequency: "weekly" as const,
        priority: 0.6,
        alternates: {
          languages: {
            "x-default": languages[DEFAULT_LOCALE] ?? url,
            ...languages,
          },
        },
      };
    }),
  );
}

/**
 * Genera el sitemap del sitio: una entrada por cada ruta pública estática y
 * cada idioma soportado, más una entrada por cada post de blog publicado
 * (contenido dinámico del backend), todas con las alternativas de idioma
 * (`hreflang`) enlazadas entre sí para que los buscadores no las traten
 * como contenido duplicado.
 * @returns {Promise<MetadataRoute.Sitemap>} Las entradas del sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = SITEMAP_ROUTES.flatMap(
    ({ pathname, priority, changeFrequency }) => {
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
    },
  );

  const blogPostEntries = await buildBlogPostSitemapEntries();

  return [...staticEntries, ...blogPostEntries];
}
