import { locales, pathnames } from "@/config/pathnames";

/*
 * Saneo de las URLs que se mandan a la analítica (GTM/GA4).
 *
 * Hay páginas públicas a las que se llega **desde un email con un token en la URL**: la candidatura
 * (`/empleo/candidatura/<token>`, que da acceso al estado de la solicitud y a los datos de quien la envió)
 * y la baja de comunicaciones (`/darse-de-baja?token=...`, que da de baja a quien lo abra). Con la URL
 * completa en `page_location`, ese token acababa guardado en GA4 —visible para cualquiera con acceso a la
 * propiedad, exportado a BigQuery, compartido con Google— y cualquiera de ellos podía usarlo.
 *
 * Dos medidas, las dos aquí:
 *
 * - En esas rutas **no se carga el contenedor** ({@link isAnalyticsExcludedPath}): son páginas de trámite
 *   a las que solo se llega desde el email, no hay nada que medir, y es la única forma de que ninguna
 *   etiqueta del contenedor lea `document.location` por su cuenta.
 * - Cualquier URL que sí llegue a la analítica pasa por {@link sanitizeAnalyticsUrl}: los segmentos de
 *   token se sustituyen por un marcador y los parámetros sensibles de la query se redactan. Cubre las
 *   navegaciones de cliente (si el contenedor ya estaba cargado y se entra en una de esas rutas) y el
 *   `page_referrer` de la página siguiente.
 */

/** Marcador que sustituye a un token en la URL que ve la analítica. */
export const REDACTED = "REDACTED";

/** Rutas (claves de `config/pathnames.ts`) con un token en un segmento; el segmento `[token]` se redacta. */
const TOKEN_PATH_ROUTES = ["/careers/applications/[token]"] as const;

/** Rutas (claves de `config/pathnames.ts`) en las que no se carga la analítica. */
const ANALYTICS_EXCLUDED_ROUTES = ["/careers/applications/[token]", "/unsubscribe"] as const;

/**
 * Parámetros de query que nunca deben llegar a la analítica. Se comparan en minúsculas. No son solo los que
 * usa hoy la app (`token`): también los que es fácil que aparezcan mañana en un enlace de email o un
 * callback (códigos, claves, correos).
 */
const SENSITIVE_QUERY_PARAMS = new Set([
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "changetoken",
  "challengetoken",
  "code",
  "key",
  "secret",
  "password",
  "email",
  "signature",
  "sig",
]);

type PathnameKey = keyof typeof pathnames;

/**
 * Todas las variantes localizadas de una ruta (`/careers/...` y `/empleo/...`).
 * @param {PathnameKey} route - Clave de `config/pathnames.ts`
 * @returns {string[]} Las rutas localizadas, sin prefijo de idioma
 */
function localizedVariants(route: PathnameKey): string[] {
  const entry = pathnames[route] as string | Record<string, string>;

  return typeof entry === "string" ? [entry] : Array.from(new Set(Object.values(entry)));
}

/**
 * Escapa un texto para usarlo literal dentro de una expresión regular.
 * @param {string} value - Texto
 * @returns {string} El texto escapado
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Prefijo de idioma opcional (`/en`, `/es`) delante de cualquier ruta. */
const LOCALE_PREFIX = `(?:/(?:${locales.join("|")}))?`;

/**
 * Expresión que reconoce una ruta localizada, con prefijo de idioma opcional. Cada `[param]` se convierte en
 * un grupo que captura un segmento; lo que va antes, en otro, para poder reconstruirla.
 * @param {string} localized - Ruta localizada (`/empleo/candidatura/[token]`)
 * @param {boolean} exactEnd - Si la ruta tiene que acabar ahí (permitiendo una `/` final)
 * @returns {RegExp} La expresión
 */
function routeRegExp(localized: string, exactEnd: boolean): RegExp {
  const pattern = localized
    .split(/(\[[^\]]+\])/)
    .map((part) => (/^\[[^\]]+\]$/.test(part) ? "([^/]+)" : escapeRegExp(part)))
    .join("");

  return new RegExp(`^(${LOCALE_PREFIX})${pattern}${exactEnd ? "/?$" : ""}`, "i");
}

const EXCLUDED_PATTERNS = ANALYTICS_EXCLUDED_ROUTES.flatMap((route) =>
  localizedVariants(route).map((localized) => routeRegExp(localized, true)),
);

/** Para redactar hace falta saber qué hay antes del token: la ruta sin el `[token]` final. */
const TOKEN_PATH_PATTERNS = TOKEN_PATH_ROUTES.flatMap((route) =>
  localizedVariants(route).map((localized) => {
    const prefix = localized.replace(/\/\[[^\]]+\]$/, "");
    return new RegExp(`^(${LOCALE_PREFIX}${escapeRegExp(prefix)}/)[^/]+`, "i");
  }),
);

/**
 * `true` si en esta ruta no debe cargarse ni medirse la analítica (páginas con un token en la URL).
 * @param {string} pathname - Ruta de la página (sin query), con o sin prefijo de idioma
 * @returns {boolean} Si la ruta queda fuera de la medición
 */
export function isAnalyticsExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * La ruta con los segmentos de token sustituidos por {@link REDACTED}.
 * @param {string} pathname - Ruta de la página
 * @returns {string} La ruta saneada
 */
export function sanitizeAnalyticsPathname(pathname: string): string {
  for (const pattern of TOKEN_PATH_PATTERNS) {
    if (pattern.test(pathname)) return pathname.replace(pattern, `$1${REDACTED}`);
  }

  return pathname;
}

/**
 * La query con los parámetros sensibles redactados (`?token=abc` → `?token=[redacted]`). Se conserva el
 * nombre del parámetro, que sí es útil para saber de qué enlace vino la visita.
 * @param {string} search - Query, con o sin `?` inicial
 * @returns {string} La query saneada, con `?` si no está vacía
 */
export function sanitizeAnalyticsSearch(search: string): string {
  const params = new URLSearchParams(search);
  let changed = false;

  for (const name of Array.from(new Set(params.keys()))) {
    if (SENSITIVE_QUERY_PARAMS.has(name.toLowerCase())) {
      params.set(name, REDACTED);
      changed = true;
    }
  }

  if (!changed) return search && !search.startsWith("?") ? `?${search}` : search;

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * Una URL absoluta o relativa, lista para `page_location`/`page_referrer`: segmentos de token y parámetros
 * sensibles redactados, y **sin fragmento** (`#...`), que también puede llevar tokens (flujos OAuth) y a la
 * analítica no le aporta nada. Si no se puede interpretar como URL, se devuelve vacía: mejor perder un dato
 * que mandar uno sin sanear.
 * @param {string} url - URL a sanear (`window.location.href`, `document.referrer`...)
 * @returns {string} La URL saneada, o `""` si no era una URL válida
 */
export function sanitizeAnalyticsUrl(url: string): string {
  if (!url) return "";

  try {
    const isAbsolute = /^[a-z][a-z\d+\-.]*:/i.test(url);
    const parsed = new URL(url, "http://relative.invalid");
    const path = sanitizeAnalyticsPathname(parsed.pathname);
    const search = sanitizeAnalyticsSearch(parsed.search);

    return isAbsolute ? `${parsed.origin}${path}${search}` : `${path}${search}`;
  } catch {
    return "";
  }
}
