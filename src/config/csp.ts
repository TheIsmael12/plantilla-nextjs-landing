/**
 * Content-Security-Policy de la aplicación, construida por petición en
 * `proxy.ts` (no en `next.config.ts`): necesita un nonce distinto cada vez
 * para poder quitar `'unsafe-inline'` de `script-src` sin romper los scripts
 * legítimos de la app (el de arranque de Next, `next-intl`, el de Trusted
 * Types de `[locale]/layout.tsx`) — con un nonce fijo o sin nonce, cualquier
 * script inyectado por un atacante correría igual de "confiado" que los
 * propios.
 *
 * `require-trusted-types-for 'script'` obliga a que cualquier asignación a un
 * sumidero DOM peligroso (`innerHTML`, `document.write`...) pase por un
 * `TrustedTypePolicy`, en vez de aceptar cualquier string.
 *
 * `trusted-types default html 'allow-duplicates'` — y no `'none'` — porque hay
 * dos políticas legítimas en juego, y una de ellas se registra más de una vez:
 *
 * - `default`: la registra `[locale]/layout.tsx` en un script inline, antes de
 *   que cargue nada más, para el propio runtime de producción de React/Next
 *   (hidratación, algún `innerHTML` interno de una librería). Sin ella, esas
 *   asignaciones quedaban bloqueadas de verdad en producción («This document
 *   requires 'TrustedHTML' assignment», no solo un aviso).
 * - `html`: la registra **Swiper** (`ReviewsSection.tsx`/`ServicesCarouselSection.tsx`,
 *   `swiper/shared/utils.mjs` → `setInnerHTML`) cada vez que necesita asignar
 *   `innerHTML` — y lo hace con `trustedTypes.createPolicy('html', …)` sin
 *   comprobar si ya existe. Como cada carrusel se carga con su propio
 *   `next/dynamic(() => import(...))` (`ReviewsSectionLazy.tsx`/
 *   `ServicesCarouselSectionLazy.tsx`), Turbopack empaqueta el runtime de
 *   Swiper por duplicado en dos chunks distintos; cuando ambos carruseles
 *   están montados en el home a la vez, el segundo `createPolicy('html', …)`
 *   choca con el primero («Policy with name "html" already exists»). No hay
 *   forma de inyectarle a Swiper 14.0.2 una política ya creada — es
 *   `setInnerHTML` quien decide, no algo configurable desde fuera—, así que
 *   `'allow-duplicates'` es la salida real: es la keyword que la propia CSP
 *   ofrece para esto, permite registrar una política con un nombre ya usado
 *   en vez de bloquearla.
 *
 * Cuando existe una política llamada exactamente `default`, el navegador la
 * usa automáticamente para cualquier asignación que no pase ya por una
 * política explícita.
 */

/** Widget de captcha del formulario de contacto (`Captcha.tsx`): único script de terceros de la app. */
const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

/** Mapa embebido de la página de contacto (`ContactMapSection.tsx`, `<iframe src="...google.com/maps...">`). */
const GOOGLE_MAPS_EMBED_ORIGIN = "https://www.google.com";

/**
 * Google Analytics (GA4, `GoogleAnalytics.tsx`), solo si `ENV.GOOGLE_ANALYTICS_ID` está
 * configurado. `googletagmanager.com` sirve el script `gtag.js`; `'strict-dynamic'` ya
 * permitiría cargarlo sin listarlo (lo carga un script con nonce), pero `connect-src` no se
 * beneficia de `'strict-dynamic'` — las peticiones de medición de gtag.js a
 * `google-analytics.com`/`analytics.google.com` se bloquearían igual sin esta entrada.
 *
 * `*.google-analytics.com` (con comodín) y no solo `www.google-analytics.com`: gtag.js elige en
 * runtime un endpoint de medición "regional" (`region1.google-analytics.com`, `regionN...`)
 * según la localización del visitante para reducir latencia — sin el comodín, esas peticiones
 * se bloqueaban con el mismo error para visitantes fuera de la región por defecto.
 */
const GOOGLE_ANALYTICS_ORIGINS = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://analytics.google.com",
];

/**
 * Tiles del mapa (CARTO Voyager, `ServiceDetailZonesCanvas.tsx`/`ContactMapCanvas.tsx`):
 * servidos desde subdominios rotativos `a`–`d` (`{s}.basemaps.cartocdn.com`) para repartir la
 * carga entre varios hosts, de ahí el comodín en vez de listar los cuatro sueltos.
 */
const MAP_TILES_ORIGIN = "https://*.basemaps.cartocdn.com";

/**
 * Origen del backend, necesario en `img-src`/`connect-src`: las portadas del
 * blog y otros recursos se sirven desde ahí, no desde el propio dominio. Se
 * deduce de `API_BASE_URL` (la misma variable que usa `config/env.ts`); si no
 * está definida, la CSP se queda sin ese origen en vez de impedir el arranque
 * — de que falte la variable ya se queja `env.ts`.
 * @returns {string} El origen del backend, o cadena vacía si `API_BASE_URL` no es una URL válida
 */
function resolveBackendOrigin(): string {
  try {
    return new URL(process.env.API_BASE_URL ?? "").origin;
  } catch {
    return "";
  }
}

/**
 * Construye la cabecera `Content-Security-Policy` para una petición dada.
 * @param {string} nonce - Nonce único de esta petición, ya generado por `proxy.ts`
 * @returns {string} El valor completo de la cabecera `Content-Security-Policy`
 */
export function buildContentSecurityPolicy(nonce: string): string {
  const backendOrigin = resolveBackendOrigin();
  // Se lee `process.env` directamente (no `ENV.GOOGLE_ANALYTICS_ID` de
  // `config/env.ts`) para no acoplar este módulo, que también evalúa
  // `next.config.ts` en build time, al módulo de configuración pública.
  const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID);

  return [
    "default-src 'self'",
    // `'strict-dynamic'` deja que los scripts cargados por uno ya confiado
    // (con nonce) carguen a su vez otros sin que cada uno necesite su propio
    // nonce — es lo que necesita el runtime de Next para sus chunks
    // dinámicos. Los navegadores que lo entienden ignoran la lista de hosts
    // de después; los que no, caen a esa lista (Turnstile, Google Analytics)
    // como respaldo.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${TURNSTILE_ORIGIN}${analyticsEnabled ? ` ${GOOGLE_ANALYTICS_ORIGINS.join(" ")}` : ""}`,
    // `'unsafe-inline'` se queda solo en `style-src`: Next.js no permite
    // todavía nonce en los `<style>` que inyecta por RSC/CSS-in-JS del propio
    // framework, y bloquearlos rompería el pintado. El riesgo que cubre un
    // nonce en `script-src` (ejecución de código arbitrario) no es el mismo
    // que el de CSS inyectado.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${MAP_TILES_ORIGIN}${backendOrigin ? ` ${backendOrigin}` : ""}`,
    "font-src 'self' data:",
    `connect-src 'self'${backendOrigin ? ` ${backendOrigin}` : ""}${analyticsEnabled ? ` ${GOOGLE_ANALYTICS_ORIGINS.join(" ")}` : ""}`,
    `frame-src 'self' ${TURNSTILE_ORIGIN} ${GOOGLE_MAPS_EMBED_ORIGIN}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "require-trusted-types-for 'script'",
    // `nextjs`: el propio runtime de Next registra su política con este nombre para el
    // cargador de chunks dinámicos (`packages/next/src/client/trusted-types.ts` en el código
    // fuente de Next, aunque el proyecto use Turbopack) — no reutiliza la política `default` de
    // la app para asignar `script.src` al cargar un chunk. Sin este nombre en la lista, el
    // navegador rechaza esa asignación aunque `default` ya esté registrada y funcionando para
    // el resto de la app: «This document requires 'TrustedScriptURL' assignment», visto en
    // producción exactamente en el cargador de chunks (`loadChunkCached`), no en código propio.
    "trusted-types default html nextjs 'allow-duplicates'",
  ].join("; ");
}
