// Solo servidor: devuelve los tokens de la API del portal, que no deben acabar nunca en un bundle de
// cliente. `server-only` lo convierte en error de compilación si alguien lo importa desde el navegador.
import "server-only";

import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

import { AUTH_COOKIE_NAMES } from "@/config/authCookies";
import { ENV_SERVER as ENV } from "@/config/env.server";
import { ensureFreshAccessToken } from "@/lib/authOptions";

import type { PortalBackendTokens } from "@/types/auth/login";

/**
 * Los tokens de la API del portal (`accessToken`/`refreshToken`) de la petición en curso, leídos
 * directamente del JWT cifrado de NextAuth.
 *
 * **Por qué no salen de `getServerSession`.** Hasta ahora el callback `session` los copiaba a
 * `session.user.backendTokens` para que `fetch.ts` los encontrara; pero ese mismo objeto es el que NextAuth
 * sirve por HTTP en `GET`/`POST /api/auth/session` (`useSession()`, `update()`), así que había que acordarse
 * de recortarlo en la ruta de NextAuth — y el `POST` se había quedado sin recortar. Con los tokens fuera de
 * la sesión ya no hay nada que filtrar: la sesión solo lleva lo que puede ver el navegador, y el servidor los
 * lee de la cookie `httpOnly`, que es donde de verdad viven.
 *
 * **La renovación se conserva.** `getServerSession` pasaba por el callback `jwt`, que renueva el
 * `accessToken` si está a punto de caducar; aquí se llama a la misma función (`ensureFreshAccessToken`), con
 * la misma caché de rotación compartida del proceso (`portalRefreshTokenCache`), así que dos lecturas
 * seguidas con el token caducado no canjean dos veces el mismo `refreshToken`. Igual que antes, desde un
 * Server Component la cookie no se puede reescribir: el token renovado vale para esta petición y la cookie
 * la actualiza el route handler de NextAuth (el latido de `portalSessionMonitor`).
 *
 * Se leen con `getToken` y no con `decode` a pelo porque `getToken` junta los trozos de una cookie
 * troceada (`name.0`, `name.1`...) cuando el JWT pasa de 4 KB. Las cabeceras van vacías a propósito:
 * `getToken` acepta también el JWT en `Authorization: Bearer`, y aquí la única fuente válida es la cookie.
 * @returns {Promise<PortalBackendTokens | null>} Los tokens de la sesión, o `null` si no hay sesión válida
 */
export async function getPortalBackendTokens(): Promise<PortalBackendTokens | null> {
  const cookieStore = await cookies();

  const token = await getToken({
    // `getToken` solo necesita `cookies.getAll()` y `headers`; el `ReadonlyRequestCookies` de `cookies()`
    // cumple lo primero. El cast es porque su tipo pide un `NextRequest`/`NextApiRequest` completo.
    req: { cookies: cookieStore, headers: new Headers() } as unknown as Parameters<
      typeof getToken
    >[0]["req"],
    cookieName: AUTH_COOKIE_NAMES.sessionToken,
    secureCookie: ENV.IS_PRODUCTION,
    secret: ENV.NEXTAUTH_SECRET,
  });

  if (!token?.backendTokens?.accessToken) return null;

  const fresh = await ensureFreshAccessToken(token);

  return fresh.backendTokens;
}

/**
 * Atajo de {@link getPortalBackendTokens} para quien solo necesita el `accessToken` (route handlers de PDFs,
 * `fetchDataToken`).
 * @returns {Promise<string | null>} El `accessToken`, o `null` si no hay sesión válida
 */
export async function getPortalAccessToken(): Promise<string | null> {
  return (await getPortalBackendTokens())?.accessToken ?? null;
}
