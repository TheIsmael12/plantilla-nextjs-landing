import { Metadata } from "next";

import { ENV } from "@/config/env";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@/config/locales";
import { getPathname, type AnyHref } from "@/i18n/navigation";

/**
 * Ruta localizada de la ficha de una oferta.
 *
 * El pathname canónico y el slug van **por separado**: es lo único que permite a next-intl traducir el
 * segmento estático (`/empleo` en español) antes de sustituir el slug. Pasándole la ruta ya montada como
 * cadena, `getPathname` no la reconoce y la devuelve tal cual — es decir, `/careers/...` en español, que es
 * un 404.
 * @param {string} slug - Slug de la oferta en ese idioma
 * @param {string} locale - Idioma al que resolver la ruta
 * @returns {string} La ruta localizada, sin el dominio
 */
function localizedJobPath(slug: string, locale: string): string {
  return getPathname({
    href: { pathname: "/careers/[slug]", params: { slug } } as AnyHref,
    locale,
  });
}

/**
 * Genera los metadatos de `careers/[slug]/page.tsx` a partir de la oferta real, igual que
 * {@link import('./generateBlogPostMetadata').generateBlogPostMetadata} hace con un post y por el mismo
 * motivo: {@link import('./generateMetadata').generateTranslatedMetadata} solo resuelve rutas estáticas.
 *
 * Dos diferencias con el blog que no son de estilo:
 *
 * - **Los `hreflang` salen de `alternateSlugs`**, no de la ruta con otro locale: la URL de empleo está
 *   traducida (`/empleo` vs `/careers`) *y* el slug también, así que construirla a mano apuntaría a una
 *   página que no existe. Un idioma sin traducción publicada no aparece: es preferible no declararlo a
 *   declarar un 404.
 * - **`openGraph.type` es `article` con `expirationTime`**: una oferta caduca, y esa fecha es la misma que
 *   el `validThrough` del JSON-LD.
 * @param {PublicJobDetail} job - Oferta ya resuelta
 * @param {string} locale - Locale actual de la página
 * @returns {Metadata} Metadatos completos de la oferta
 */
export function generateJobPostingMetadata(job: PublicJobDetail, locale: string): Metadata {
  const baseUrl = ENV.APP_URL.replace(/\/$/, "");

  const fullTitle = `${job.metaTitle || job.title} | ${ENV.APP_NAME}`;
  const description = job.metaDescription || job.summary;

  const canonicalUrl = `${baseUrl}${localizedJobPath(job.slug, locale)}`;

  const languages = SUPPORTED_LOCALES.reduce<Record<string, string>>((acc, supported) => {
    const slug = supported === locale ? job.slug : job.alternateSlugs[supported];
    if (!slug) return acc;

    acc[supported] = `${baseUrl}${localizedJobPath(slug, supported)}`;
    return acc;
  }, {});

  const ogImageUrl = ENV.OG_IMAGE.startsWith("http")
    ? ENV.OG_IMAGE
    : `${baseUrl}${ENV.OG_IMAGE}`;

  return {
    title: fullTitle,
    description,
    robots: "index, follow",
    publisher: ENV.APP_NAME,
    applicationName: ENV.APP_NAME,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    creator: ENV.APP_NAME,
    authors: [{ name: ENV.APP_NAME, url: ENV.APP_URL }],
    icons: { icon: "/icon.png", shortcut: "/favicon.ico", apple: "/icon.png" },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "x-default": languages[DEFAULT_LOCALE] || canonicalUrl,
        ...languages,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      type: "article",
      locale: locale as AppLocale,
      siteName: ENV.APP_NAME,
      publishedTime: job.publishedAt,
      expirationTime: job.expiresAt,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
  };
}
