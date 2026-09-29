import { NextResponse, type NextRequest } from "next/server";

import { ENV_SERVER as ENV } from "@/config/env.server";
import { HTTPStatus } from "@/constants/httpStatus";
import { getPortalAccessToken } from "@/lib/portalBackendTokens";
import { isSafePathSegment } from "@/utils/apiPathUtils";

/**
 * Proxy autenticado del PDF de una factura. Existe porque el backend exige
 * `Authorization: Bearer` en `client/me/invoices/:id/pdf` y un `<a href>` del
 * navegador no puede añadir esa cabecera: el enlace apunta a esta ruta
 * same-origin, que sí recibe la cookie de sesión de NextAuth, resuelve el
 * token server-side y reenvía el binario tal cual.
 * @param {NextRequest} _req - Petición entrante, no usada (el id viaja en la ruta)
 * @param {{params: Promise<{id: string}>}} context - Parámetros de ruta con el id de la factura
 * @returns {Promise<NextResponse>} El PDF, o el mismo estado de error que devolvió el backend
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // El token se lee en servidor del JWT de la cookie: la sesión ya no lo lleva (ver `lib/portalBackendTokens.ts`).
  const accessToken = await getPortalAccessToken();

  if (!accessToken) {
    return new NextResponse(null, { status: HTTPStatus.UNAUTHORIZED });
  }

  const { id } = await params;

  // El id va a la ruta del backend: con `.`/`..` (o `%2e%2e`) el parser de URLs lo resolvería saliéndose de
  // `client/me/...`, así que lo que no tenga forma de identificador no llega a pedirse.
  if (!isSafePathSegment(id)) {
    return new NextResponse(null, { status: HTTPStatus.NOT_FOUND });
  }

  const backendResponse = await fetch(
    `${ENV.BACKEND_URL}/client/me/invoices/${encodeURIComponent(id)}/pdf`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!backendResponse.ok) {
    return new NextResponse(null, { status: backendResponse.status });
  }

  return new NextResponse(backendResponse.body, {
    status: HTTPStatus.OK,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": backendResponse.headers.get("Content-Disposition") ?? "inline",
    },
  });
}
