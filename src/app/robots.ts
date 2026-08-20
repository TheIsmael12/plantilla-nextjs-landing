import { MetadataRoute } from "next";

import { ENV } from "@/config/env";

const BASE_URL = ENV.APP_URL;

/**
 * Rutas privadas (portal de cliente, autenticación, enlaces de un solo uso para vecinos) que
 * ningún buscador real debe indexar — el comentario que las anunciaba llevaba tiempo sin código
 * detrás, así que hasta ahora `robots.txt` solo bloqueaba `/api/`. Comodín delante de cada
 * patrón para cubrir el prefijo de locale (`/es/area-privada/...`, `/en/private-area/...`) sin
 * enumerar cada ruta hija ni cada idioma por separado.
 */
const PRIVATE_ROUTE_PATTERNS = [
  "/*/private-area/",
  "/*/area-privada/",
  "/*/login",
  "/*/iniciar-sesion",
  "/*/forgot-password",
  "/*/recuperar-acceso",
  "/*/reset-password",
  "/*/recuperar-contrasena",
  "/*/change-password",
  "/*/cambiar-contrasena",
  "/*/verify-email",
  "/*/verificar-email",
  // Enlaces de un solo uso para un vecino de la app móvil (invitación, restablecer
  // contraseña), nunca pensados para llegar por búsqueda.
  "/*/resident/",
];

/**
 * Enlace de seguimiento de una candidatura (`/empleo/candidatura/<token>`,
 * `/careers/applications/<token>`): la página de una sola persona, a la que se llega
 * por un enlace firmado que va en un correo. Que un token acabe en un índice sería una
 * fuga, no un problema de posicionamiento — la página va además `noindex, nofollow`
 * desde su propio `generateMetadata`, que es lo que de verdad la mantiene fuera.
 *
 * Se escriben las dos formas de cada ruta a propósito, con y sin comodín de locale:
 * `localePrefix: "as-needed"` sirve el idioma por defecto **sin** prefijo
 * (`/empleo/candidatura/...`), así que un patrón con comodín de locale delante no basta por sí
 * solo. Es la lección de `requisitos-seo.md` §26, donde los patrones anunciados no
 * casaban con ninguna ruta real: hay una prueba (`test/careersRobots.test.ts`) que
 * comprueba que estos sí casan.
 */
const APPLICATION_TRACKING_PATTERNS = [
  "/empleo/candidatura/",
  "/*/empleo/candidatura/",
  "/careers/applications/",
  "/*/careers/applications/",
];

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
          ...PRIVATE_ROUTE_PATTERNS,
          ...APPLICATION_TRACKING_PATTERNS,
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
        disallow: ["/api/", ...APPLICATION_TRACKING_PATTERNS],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/"],
        disallow: ["/api/", ...APPLICATION_TRACKING_PATTERNS],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: ["/"],
        disallow: ["/api/", ...APPLICATION_TRACKING_PATTERNS],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/"],
        disallow: ["/api/", ...APPLICATION_TRACKING_PATTERNS],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/"],
        disallow: ["/api/", ...APPLICATION_TRACKING_PATTERNS],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/"],
        disallow: ["/api/", ...APPLICATION_TRACKING_PATTERNS],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/"],
        disallow: ["/api/", ...APPLICATION_TRACKING_PATTERNS],
      },
      {
        userAgent: "YouBot",
        allow: ["/"],
        disallow: ["/api/", ...APPLICATION_TRACKING_PATTERNS],
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
        disallow: ["/api/", ...PRIVATE_ROUTE_PATTERNS, ...APPLICATION_TRACKING_PATTERNS],
      },

      // ── Permitir explícitamente Bingbot ────────────────────────────────
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: ["/api/", ...PRIVATE_ROUTE_PATTERNS, ...APPLICATION_TRACKING_PATTERNS],
      },
    ],

    // Un único sitemap: `sitemap.ts` ya combina las rutas estáticas con los posts del
    // blog (leídos del backend vía `getBlogSitemapEntries`), no hay un `/blog-sitemap.xml`
    // aparte — esa segunda entrada apuntaba a una URL que nunca existió en el proyecto y
    // que Googlebot/Bingbot habrían encontrado como 404 al intentar leerla.
    sitemap: [`${BASE_URL}/sitemap.xml`],
    // Feed RSS (descubrimiento automático por crawlers): `GET /feed.xml`.
    host: BASE_URL,
  };
}
