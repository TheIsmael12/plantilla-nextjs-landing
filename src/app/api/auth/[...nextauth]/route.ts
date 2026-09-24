import NextAuth from "next-auth";

import type { NextRequest } from "next/server";

import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

/**
 * Ruta de NextAuth, con el `GET /api/auth/session` filtrado.
 *
 * La sesión que construye el callback `session` de `authOptions` incluye
 * `user.backendTokens` (el `accessToken` y el `refreshToken` del portal), porque
 * `actions/fetch.ts` los necesita en servidor para autenticar cada llamada. Ese
 * mismo objeto es el que NextAuth devuelve por HTTP a `useSession()`, así que
 * sin este filtro los tokens de la API quedaban al alcance de cualquier script
 * del navegador — y con ellos, un XSS o una extensión maliciosa podría hablar
 * con la API en nombre del cliente, saltándose que la cookie sea `httpOnly`.
 *
 * Y el `refreshToken` es el peor de los dos: dura siete días y se puede canjear
 * por pares nuevos, así que quien lo copie mantiene el acceso aunque el cliente
 * cierre sesión en su navegador.
 *
 * El cliente no usa esos tokens en ningún punto (todas las llamadas salen de
 * Server Actions), así que se recortan solo de la respuesta HTTP: en servidor,
 * `getServerSession` no pasa por esta ruta y los sigue viendo.
 *
 * Es el mismo filtro que ya tenía la intranet (`plantilla-nextjs`), que es donde
 * se detectó primero; aquí faltaba.
 * @param {NextRequest} request - Petición entrante a `/api/auth/*`
 * @param {{ params: Promise<{ nextauth: string[] }> }} context - Contexto de la ruta, que NextAuth necesita para resolver la acción
 * @returns {Promise<Response>} La respuesta de NextAuth, sin los tokens de la API cuando es la de sesión
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> },
): Promise<Response> {
  const response = await handler(request, context);

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

export { handler as POST };
