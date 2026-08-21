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
 * Medición de Google (el contenedor de GTM y las etiquetas de GA4 que monta dentro,
 * `GoogleTagManager.tsx`), solo si `NEXT_PUBLIC_GTM_ID` está configurado.
 * `googletagmanager.com` sirve `gtm.js` y `gtag.js`; `'strict-dynamic'` ya permitiría
 * cargarlos sin listarlos (los carga el script de arranque, que va con nonce), pero
 * `connect-src` **no** se beneficia de `'strict-dynamic'` — sin esta entrada los envíos de
 * medición a `googletagmanager.com/g/collect` y a
 * `google-analytics.com`/`analytics.google.com` se bloquean igual, y el bloqueo solo se ve
 * en la consola del navegador: para Google es indistinguible de que no haya tráfico.
 *
 * **Se mira `NEXT_PUBLIC_GTM_ID` y no la vieja `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`**: esa
 * segunda instalación directa de `gtag.js` ya no existe (se cargaba sin declarar
 * `consent default`, así que escribía cookies antes del banner y duplicaba las visitas
 * del contenedor). Mientras la condición siguió colgando de ella, un despliegue con
 * contenedor y sin esa variable dejaba a GTM cargado pero con `connect-src` cerrado.
 *
 * `*.google-analytics.com` (con comodín) y no solo `www.google-analytics.com`: gtag.js elige en
 * runtime un endpoint de medición "regional" (`region1.google-analytics.com`, `regionN...`)
 * según la localización del visitante para reducir latencia — sin el comodín, esas peticiones
 * se bloqueaban con el mismo error para visitantes fuera de la región por defecto.
 */
const GOOGLE_MEASUREMENT_ORIGINS = [
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
 * Variante `wss://` del origen del backend, para el WebSocket de tiempo real del portal de
 * cliente (`RealtimeProvider.tsx`). CSP trata `https://` y `wss://` sobre el mismo host como
 * orígenes **distintos** — listar solo el primero en `connect-src` deja pasar el `fetch`/XHR
 * normal pero bloquea la conexión del socket en silencio (visto en producción en
 * `plantilla-nextjs`, mismo `RealtimeProvider.tsx`: «violates the following Content Security
 * Policy directive: "connect-src ... https://api.imora.es"» al intentar conectar
 * `wss://api.imora.es`).
 * @returns {string} El origen `wss://` del backend, o cadena vacía si `API_BASE_URL` no es una URL válida
 */
function resolveBackendWebSocketOrigin(): string {
  try {
    const { host, protocol } = new URL(process.env.API_BASE_URL ?? "");
    return `${protocol === "http:" ? "ws:" : "wss:"}//${host}`;
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
  const backendWebSocketOrigin = resolveBackendWebSocketOrigin();
  // Se lee `process.env` directamente (no `ENV.GTM_ID` de `config/env.ts`) para no
  // acoplar este módulo, que también evalúa `next.config.ts` en build time, al módulo
  // de configuración pública.
  const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_GTM_ID);

  return [
    "default-src 'self'",
    // `'strict-dynamic'` deja que los scripts cargados por uno ya confiado
    // (con nonce) carguen a su vez otros sin que cada uno necesite su propio
    // nonce — es lo que necesita el runtime de Next para sus chunks
    // dinámicos. Los navegadores que lo entienden ignoran la lista de hosts
    // de después; los que no, caen a esa lista (Turnstile, la medición de
    // Google) como respaldo.
    //
    // `'unsafe-inline'` al final, retrocompatible con navegadores antiguos que no entienden
    // `nonce-*`/`strict-dynamic` (Lighthouse, "Asegura que la CSP sea efectiva frente a ataques
    // XSS"): cualquier navegador que sí reconoce nonces la ignora por completo (CSP Level 3, ya
    // no cae a `'unsafe-inline'` cuando hay un nonce válido en la misma directiva), así que no
    // reabre la protección real para el caso normal — solo evita que un navegador muy antiguo se
    // quede sin ninguna política de scripts en vez de una parcial.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${TURNSTILE_ORIGIN}${analyticsEnabled ? ` ${GOOGLE_MEASUREMENT_ORIGINS.join(" ")}` : ""} 'unsafe-inline'`,
    // `'unsafe-inline'` se queda solo en `style-src`: Next.js no permite
    // todavía nonce en los `<style>` que inyecta por RSC/CSS-in-JS del propio
    // framework, y bloquearlos rompería el pintado. El riesgo que cubre un
    // nonce en `script-src` (ejecución de código arbitrario) no es el mismo
    // que el de CSS inyectado.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${MAP_TILES_ORIGIN}${backendOrigin ? ` ${backendOrigin}` : ""}`,
    "font-src 'self' data:",
    `connect-src 'self'${backendOrigin ? ` ${backendOrigin}` : ""}${backendWebSocketOrigin ? ` ${backendWebSocketOrigin}` : ""}${analyticsEnabled ? ` ${GOOGLE_MEASUREMENT_ORIGINS.join(" ")}` : ""}`,
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
