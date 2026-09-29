import NextAuth from "next-auth";

import type { NextRequest } from "next/server";

import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

/** Contexto de la ruta, que NextAuth necesita para resolver la acción (`session`, `csrf`, `callback`...). */
type NextAuthRouteContext = { params: Promise<{ nextauth: string[] }> };

/**
 * Quita `user.backendTokens` de la respuesta de `/api/auth/session`, si por lo que sea llegara a llevarlos.
 *
 * **Hoy no debería hacer nada**: el callback `session` de `authOptions` ya no copia los tokens de la API a
 * la sesión (el servidor los lee del JWT, ver `lib/portalBackendTokens.ts`). Se mantiene como defensa en
 * profundidad, porque el día que alguien vuelva a meterlos en la sesión —"los necesito en este componente"—
 * este objeto es exactamente lo que NextAuth devuelve por HTTP al navegador, y con el `refreshToken` (siete
 * días, canjeable por pares nuevos) un XSS o una extensión mantendría el acceso aunque el cliente cerrara
 * sesión.
 *
 * Se aplica a `GET` **y a `POST`**: `useSession().update()` es un `POST /api/auth/session` que devuelve la
 * misma sesión, y antes ese verbo se exportaba sin filtrar.
 * @param {NextRequest} request - Petición entrante a `/api/auth/*`
 * @param {Response} response - Respuesta que ha generado NextAuth
 * @returns {Promise<Response>} La misma respuesta, o una reconstruida sin los tokens
 */
async function stripBackendTokens(request: NextRequest, response: Response): Promise<Response> {
  if (!request.nextUrl.pathname.endsWith("/session")) return response;

  const session = await response
    .clone()
    .json()
    .catch(() => null);

  if (!session?.user?.backendTokens) return response;

  const { backendTokens: _backendTokens, ...user } = session.user;

  // Se reconstruye la respuesta en vez de copiar sus cabeceras: `content-length`
  // ya no cuadraría con el cuerpo recortado y el cliente leería un JSON
  // truncado. Las `Set-Cookie` sí hay que arrastrarlas — NextAuth puede rotar
  // la cookie de sesión en esta misma petición.
  const filtered = Response.json({ ...session, user }, { status: response.status });

  for (const cookie of response.headers.getSetCookie()) {
    filtered.headers.append("set-cookie", cookie);
  }

  return filtered;
}

/**
 * `GET /api/auth/*` de NextAuth (sesión, CSRF, proveedores...), con la sesión filtrada.
 * @param {NextRequest} request - Petición entrante
 * @param {NextAuthRouteContext} context - Contexto de la ruta
 * @returns {Promise<Response>} La respuesta de NextAuth, sin tokens de la API
 */
export async function GET(request: NextRequest, context: NextAuthRouteContext): Promise<Response> {
  return stripBackendTokens(request, await handler(request, context));
}

/**
 * `POST /api/auth/*` de NextAuth (login, logout, `update()` de la sesión), con la sesión filtrada.
 * @param {NextRequest} request - Petición entrante
 * @param {NextAuthRouteContext} context - Contexto de la ruta
 * @returns {Promise<Response>} La respuesta de NextAuth, sin tokens de la API
 */
export async function POST(request: NextRequest, context: NextAuthRouteContext): Promise<Response> {
  return stripBackendTokens(request, await handler(request, context));
}
