import { Metadata } from "next";

import { ENV } from "@/config/env";
import { DEFAULT_LOCALE, type AppLocale } from "@/config/locales";
import type { BlogPostDetail } from "@/types/blog/blog";

/**
 * Genera los metadatos de `blog/[slug]/page.tsx` a partir del contenido real
 * del post (`seoTitle`/`seoDescription`/`ogImageUrl`/`canonicalUrl`), en vez
 * del namespace `Metadata.routes.*` que usa {@link import('./generateMetadata').generateTranslatedMetadata}
 * para el resto del sitio: esa función traduce solo rutas estáticas y deja
 * explícitamente sin resolver cualquier ruta dinámica (`canonicalPathname.includes("[")`),
 * así que esta es la primera página del proyecto con su propio `generateMetadata`.
 * @param {BlogPostDetail} post - Post ya resuelto (detalle completo)
 * @param {string} locale - Locale actual de la página
 * @returns {Metadata} Metadatos completos del post (title, description, robots, openGraph, twitter, alternates)
 */
export function generateBlogPostMetadata(post: BlogPostDetail, locale: string): Metadata {
  const baseUrl = ENV.APP_URL.replace(/\/$/, "");

  const fullTitle = `${post.seoTitle || post.title} | ${ENV.APP_NAME}`;
  const description = post.seoDescription || post.excerpt;

  const canonicalUrl = post.canonicalUrl || `${baseUrl}/${locale}/blog/${post.slug}`;

  // A diferencia de las páginas estáticas (todas disponibles en todos los
  // locales soportados), un post puede no tener traducción en cada idioma:
  // `availableLocales` es la fuente de verdad de en qué locales existe.
  const languages = post.availableLocales.reduce<Record<string, string>>(
    (acc, { locale: availableLocale, slug }) => {
      acc[availableLocale] = `${baseUrl}/${availableLocale}/blog/${slug}`;
      return acc;
    },
    {},
  );

  const ogImageUrl = post.ogImageUrl || post.coverUrl || ENV.OG_IMAGE;
  const absoluteOgImageUrl = ogImageUrl.startsWith("http") ? ogImageUrl : `${baseUrl}${ogImageUrl}`;

  return {
    title: fullTitle,
    description,
    robots: post.noindex ? "noindex, nofollow" : "index, follow",
    publisher: ENV.APP_NAME,
    applicationName: ENV.APP_NAME,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    creator: post.author.name,
    authors: [{ name: post.author.name }],
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
      publishedTime: post.firstPublishedAt || post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags.map((tag) => tag.name),
      images: [
        {
          url: absoluteOgImageUrl,
          secureUrl: absoluteOgImageUrl,
          width: 1200,
          height: 630,
          alt: post.coverImageAlt || fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteOgImageUrl],
    },
  };
}
