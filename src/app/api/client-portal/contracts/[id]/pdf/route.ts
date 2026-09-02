import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

import { ENV_SERVER as ENV } from "@/config/env.server";
import { HTTPStatus } from "@/constants/httpStatus";
import { authOptions } from "@/lib/authOptions";

/**
 * Proxy autenticado del PDF de un contrato pendiente de firma.
 *
 * Mismo motivo que el del contrato de un servicio: el backend exige `Authorization: Bearer` y un `<a href>`
 * del navegador no puede añadir esa cabecera, así que el enlace apunta aquí —same-origin, con la cookie de
 * sesión— y esta ruta resuelve el token en servidor y reenvía el binario tal cual.
 *
 * Es una ruta aparte y no la misma porque son dos documentos distintos: aquel es el contrato **de un
 * servicio ya contratado**, y este es uno que todavía está esperando firma y por tanto no tiene servicio
 * ninguno al que colgarse.
 * @param {NextRequest} _req - Petición entrante, no usada (el id viaja en la ruta)
 * @param {{params: Promise<{id: string}>}} context - Parámetros de ruta con el id del contrato
 * @returns {Promise<NextResponse>} El PDF, o el mismo estado de error que devolvió el backend
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user.backendTokens?.accessToken) {
    return new NextResponse(null, { status: HTTPStatus.UNAUTHORIZED });
  }

  const { id } = await params;

  const backendResponse = await fetch(
    `${ENV.BACKEND_URL}/client/me/contracts/${encodeURIComponent(id)}/pdf`,
    { headers: { Authorization: `Bearer ${session.user.backendTokens.accessToken}` } },
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
