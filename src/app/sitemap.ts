import type { MetadataRoute } from "next";

import { getBlogSitemapEntries } from "@/actions/blog/blog-actions";
import { getCareersSitemapEntries } from "@/actions/careers/careers-actions";
import { ENV } from "@/config/env";
import { DEFAULT_LOCALE } from "@/config/locales";
import { locales, pathnames } from "@/config/pathnames";
import type { BlogSitemapEntry } from "@/types/blog/blog";
import type { StaticPathname } from "@/types/route";

const BASE_URL = ENV.APP_URL.replace(/\/$/, "");

// Rutas públicas realmente construidas (tienen `page.tsx`) y pensadas para
// indexarse. Las páginas de autenticación/área de cliente y las marcadas
// `noindex` en `NOINDEX_PATHNAMES` (`utils/routingUtils.ts`: hub de ayuda,
// soporte, canales de reclamaciones) se dejan fuera a propósito. El listado
// de `/blog` y el buscador de `/careers` sí entran aquí (contenido estático
// de la página); las ofertas y los posts individuales se añaden aparte, vía
// `buildCareersSitemapEntries` y `buildBlogPostSitemapEntries` (contenido
// dinámico del backend, con su propio `lastModified` real por idioma).
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
  { pathname: "/careers", priority: 0.7, changeFrequency: "daily" },
  { pathname: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/help/faq", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { pathname: "/conditions", priority: 0.3, changeFrequency: "yearly" },
  { pathname: "/cookies-policy", priority: 0.3, changeFrequency: "yearly" },
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
 * Resuelve el pathname localizado de una ruta **dinámica** sustituyendo sus
 * segmentos `[param]`. `localizedPathFor` no sirve aquí: está tipada como
 * `StaticPathname` justo para que nadie le pase una plantilla sin resolver.
 * @param {"/careers/[slug]" | "/careers/cities/[city]"} pathname - Ruta canónica con segmentos dinámicos
 * @param {Record<string, string>} params - Valor de cada segmento, sin los corchetes
 * @param {(typeof locales)[number]} locale - Idioma al que resolver la ruta
 * @returns {string} La ruta localizada y ya resuelta, sin el dominio
 */
function localizedDynamicPathFor(
  pathname: "/careers/[slug]" | "/careers/cities/[city]",
  params: Record<string, string>,
  locale: (typeof locales)[number],
): string {
  const entry = pathnames[pathname];
  const template = typeof entry === "string" ? entry : entry[locale];

  const localized = Object.entries(params).reduce<string>(
    (acc, [key, value]) => acc.replace(`[${key}]`, value),
    template,
  );

  return locale === DEFAULT_LOCALE ? localized : `/${locale}${localized}`;
}

/**
 * Construye las entradas del sitemap de empleo: una por oferta vigente y locale, más una por cada
 * página de ciudad que **de verdad tiene ofertas**.
 *
 * Tres decisiones que vienen del propio módulo:
 *
 * - **Las ciudades salen de las ofertas**, no del catálogo. Una ciudad configurada en la intranet pero
 *   sin ninguna oferta abierta responde 404 en el landing (`CityJobsViewPage`), así que meterla aquí
 *   sería declarar en el sitemap una URL que sabemos que no existe.
 * - **Sin `alternates` por oferta.** El endpoint de sitemap no dice en qué otros idiomas está publicada
 *   esa oferta; el `hreflang` correcto lo emite la propia ficha desde `alternateSlugs`. Es mejor no
 *   declarar la relación que declararla mal y que los buscadores descarten el canonical.
 * - **Si el backend no responde, se devuelve un array vacío**, igual que el blog: el sitemap de las
 *   rutas estáticas es más importante que el de empleo.
 * @returns {Promise<MetadataRoute.Sitemap>} Las entradas de ofertas y de páginas de ciudad
 */
async function buildCareersSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const entriesByLocale = await Promise.all(
    locales.map(async (locale) => {
      const response = await getCareersSitemapEntries(locale);
      return { locale, entries: response.data ?? [] };
    }),
  );

  return entriesByLocale.flatMap(({ locale, entries }) => {
    const jobEntries: MetadataRoute.Sitemap = entries.map((entry) => ({
      url: `${BASE_URL}${localizedDynamicPathFor("/careers/[slug]", { slug: entry.slug }, locale)}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const citySlugs = [...new Set(entries.flatMap((entry) => entry.citySlugs))];

    const cityEntries: MetadataRoute.Sitemap = citySlugs.map((citySlug) => ({
      url: `${BASE_URL}${localizedDynamicPathFor("/careers/cities/[city]", { city: citySlug }, locale)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.5,
      alternates: {
        languages: locales.reduce<Record<string, string>>(
          (acc, supported) => {
            // El slug de la ciudad es el mismo en todos los idiomas (un municipio se llama igual): lo
            // único que cambia es el prefijo de la ruta, así que aquí sí se puede cruzar el hreflang.
            acc[supported] = `${BASE_URL}${localizedDynamicPathFor(
              "/careers/cities/[city]",
              { city: citySlug },
              supported,
            )}`;
            return acc;
          },
          {
            "x-default": `${BASE_URL}${localizedDynamicPathFor(
              "/careers/cities/[city]",
              { city: citySlug },
              DEFAULT_LOCALE,
            )}`,
          },
        ),
      },
    }));

    return [...jobEntries, ...cityEntries];
  });
}
/**
 * Genera el sitemap del sitio: una entrada por cada ruta pública estática y
 * cada idioma soportado, más una entrada por cada post de blog publicado y
 * por cada oferta de empleo vigente (contenido dinámico del backend), con las
 * alternativas de idioma (`hreflang`) enlazadas entre sí para que los
 * buscadores no las traten como contenido duplicado.
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

  const [blogPostEntries, careersEntries] = await Promise.all([
    buildBlogPostSitemapEntries(),
    buildCareersSitemapEntries(),
  ]);

  return [...staticEntries, ...blogPostEntries, ...careersEntries];
}
