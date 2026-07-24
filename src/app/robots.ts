import { MetadataRoute } from "next";

import { ENV } from "@/config/env";

const BASE_URL = ENV.APP_URL;

/**
 * Genera las reglas de `robots.txt`: permite el rastreo estándar y el de
 * bots de IA con fines GEO, bloquea rutas privadas/de API y scrapers sin
 * valor, y publica las URLs de los sitemaps.
 * @returns {MetadataRoute.Robots} La configuración de robots del sitio
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Crawlers estándar ──────────────────────────────────────────────
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          // Rutas de API internas
          "/api/",
          // Rutas privadas y sus variantes traducidas
          // Parámetros de búsqueda / paginación que generan URLs duplicadas
          "/*?*page=",
          "/*?*sort=",
          "/*?*filter=",
          "/*?*search=",
        ],
      },

      // ── Crawlers de IA — acceso GEO (Generative Engine Optimization) ───
      // Se permite el contenido público para que los LLMs puedan responder
      // preguntas sobre la empresa, servicios, blog, etc.
      // Las rutas privadas siguen bloqueadas.
      {
        userAgent: "GPTBot",
        allow: ["/"],
        disallow: ["/api/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/"],
        disallow: ["/api/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: ["/"],
        disallow: ["/api/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/"],
        disallow: ["/api/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/"],
        disallow: ["/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/"],
        disallow: ["/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/"],
        disallow: ["/api/"],
      },
      {
        userAgent: "YouBot",
        allow: ["/"],
        disallow: ["/api/"],
      },
      
      // ── Scrapers genéricos sin valor GEO — seguir bloqueando ──────────

      { userAgent: "CCBot", disallow: ["/"] },
      { userAgent: "Bytespider", disallow: ["/"] },
      { userAgent: "PetalBot", disallow: ["/"] },
      { userAgent: "Diffbot", disallow: ["/"] },

      // ── Permitir explícitamente Googlebot ──────────────────────────────
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/api/"],
      },

      // ── Permitir explícitamente Bingbot ────────────────────────────────
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: ["/api/"],
      },
    ],

    sitemap: [
      `${BASE_URL}/sitemap.xml`, // páginas estáticas
      `${BASE_URL}/blog-sitemap.xml`, // posts del blog (generado por el backend)
    ],
    // RSS feeds (descubrimiento automático por crawlers)
    // GET /rss.xml        → español
    // GET /rss.xml?lang=en → inglés
    host: BASE_URL,
  };
}
