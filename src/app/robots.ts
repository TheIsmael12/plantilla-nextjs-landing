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
const PRIVATE_ROUTES = [
  "/private-area/",
  "/area-privada/",
  "/login",
  "/iniciar-sesion",
  "/forgot-password",
  "/recuperar-acceso",
  "/reset-password",
  "/recuperar-contrasena",
  "/change-password",
  "/cambiar-contrasena",
  "/verify-email",
  "/verificar-email",
  // Enlaces de un solo uso para un vecino de la app móvil (invitación, restablecer
  // contraseña), nunca pensados para llegar por búsqueda.
  "/resident/",
  // Baja de comunicaciones: solo se llega desde el enlace del email, con un token en la query.
  "/unsubscribe",
  "/darse-de-baja",
];

/*
 * Cada ruta en sus dos formas, sin prefijo y con comodín de locale.
 *
 * Solo con `/*` delante no bastaba: `localePrefix: "as-needed"` sirve el idioma por defecto **sin** prefijo,
 * y `/*` + `/iniciar-sesion` exige dos barras, así que `/iniciar-sesion` —la URL real en español— no casaba
 * con ningún patrón. Es el mismo arreglo que ya tenían las rutas de candidatura, abajo.
 */
const PRIVATE_ROUTE_PATTERNS = PRIVATE_ROUTES.flatMap((route) => [route, `/*${route}`]);

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
 * Rastreadores de IA a los que se abre el contenido público (GEO). Todos con **las mismas** exclusiones que
 * los buscadores: antes solo tenían `/api/` y las candidaturas, así que el área privada, el login y los
 * enlaces de un solo uso quedaban anunciados como rastreables para ellos.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "Claude-Web",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "YouBot",
];

/** Lo que ningún rastreador que se admite debe recorrer. */
const DISALLOWED_FOR_ALLOWED_CRAWLERS = [
  "/api/",
  ...PRIVATE_ROUTE_PATTERNS,
  ...APPLICATION_TRACKING_PATTERNS,
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
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: ["/"],
        disallow: DISALLOWED_FOR_ALLOWED_CRAWLERS,
      })),

      // ── Scrapers genéricos sin valor GEO — seguir bloqueando ──────────

      { userAgent: "CCBot", disallow: ["/"] },
      { userAgent: "Bytespider", disallow: ["/"] },
      { userAgent: "PetalBot", disallow: ["/"] },
      { userAgent: "Diffbot", disallow: ["/"] },

      // ── Permitir explícitamente Googlebot ──────────────────────────────
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: DISALLOWED_FOR_ALLOWED_CRAWLERS,
      },

      // ── Permitir explícitamente Bingbot ────────────────────────────────
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: DISALLOWED_FOR_ALLOWED_CRAWLERS,
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
