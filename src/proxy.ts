import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { locales, pathnames } from "@/config/pathnames";
import { DEFAULT_LOCALE, type AppLocale } from "@/config/locales";
import { resolveCanonicalPathname } from "@/utils/routingUtils";
import { buildContentSecurityPolicy } from "@/config/csp";

/**
 * Middleware de Next.js: resuelve el enrutado por idioma con `next-intl` y
 * anota la petición con el pathname, el locale resuelto (de la URL o, en su
 * defecto, de la cookie de preferencia) y la ruta canónica (clave de
 * `config/pathnames.ts`, independiente del idioma) para que `request.ts` y
 * `generateTranslatedMetadata` los usen.
 *
 * También genera el **nonce de la CSP**, uno distinto por petición: es lo que
 * permite quitar `'unsafe-inline'` de `script-src` sin romper los scripts que
 * la propia app necesita (el de arranque de Next, el de `next-intl`, el de
 * Trusted Types de `[locale]/layout.tsx`). Se propaga de dos formas — una
 * para cada lado de la petición:
 *
 * - `x-nonce` en `request.headers`: así `layout.tsx` puede leerlo con
 *   `headers()` en el servidor y estampárselo a su `<script>` inline.
 * - `Content-Security-Policy` en `response.headers`: Next.js **solo**
 *   auto-firma sus propios scripts (el runtime de arranque, RSC payload) con
 *   el nonce si detecta esta cabecera en la respuesta con un nonce dentro de
 *   `script-src` — sin ella, esos scripts se sirven sin nonce y la CSP
 *   estricta los bloquearía a ellos también.
 * @param {NextRequest} request Petición entrante
 * @returns {Promise<Response>} La respuesta de enrutado i18n, con las cabeceras de contexto y la CSP añadidas
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = crypto.randomUUID();

  // Lee preferencia del usuario
  const cookieLocale = request.cookies.get("locale")?.value;
  const validCookieLocale =
    cookieLocale && (locales as readonly string[]).includes(cookieLocale)
      ? (cookieLocale as (typeof locales)[number])
      : null;

  const handleI18nRouting = createMiddleware({
    locales,
    pathnames,
    defaultLocale: DEFAULT_LOCALE,
    localePrefix: "as-needed",
    localeDetection: false,
  });

  // El nonce se pasa como cabecera de PETICIÓN antes de invocar el enrutado
  // de next-intl, para que la respuesta que genere ya nazca con ella: así
  // `layout.tsx` puede leerla más abajo en la cadena de renderizado.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = handleI18nRouting(
    new NextRequest(request, { headers: requestHeaders }),
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Content-Security-Policy", buildContentSecurityPolicy(nonce));
  }

  // Si el usuario tiene cookie de locale Y la URL no tiene ya ese locale,
  // no redirigimos — solo anotamos el locale resuelto para request.ts
  // El locale real de la URL lo detecta next-intl internamente
  const urlLocale = pathname.split("/")[1];
  const resolvedLocale = ((locales as readonly string[]).includes(urlLocale)
    ? urlLocale
    : (validCookieLocale ?? DEFAULT_LOCALE)) as AppLocale;

  // Pathname localizado sin el prefijo de locale (p. ej. "/servicios/conserjeria"
  // a partir de "/es/servicios/conserjeria"), tal y como lo espera
  // `resolveCanonicalPathname` para encontrar su clave en `config/pathnames.ts`.
  const localizedPathname = (locales as readonly string[]).includes(urlLocale)
    ? pathname.slice(urlLocale.length + 1) || "/"
    : pathname;

  const canonicalPathname = resolveCanonicalPathname(localizedPathname, resolvedLocale);

  response.headers.set("x-pathname", pathname);
  response.headers.set("x-resolved-locale", resolvedLocale);
  // Ruta canónica (p. ej. "/services/concierge") independiente del idioma y
  // de la URL localizada; `null` cuando no coincide con ninguna entrada de
  // `pathnames.ts` (p. ej. una ruta que no existe, camino al 404).
  if (canonicalPathname) {
    response.headers.set("x-canonical-pathname", canonicalPathname);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
