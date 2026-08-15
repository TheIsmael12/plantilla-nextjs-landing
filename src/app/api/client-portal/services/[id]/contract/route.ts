import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

import { ENV_SERVER as ENV } from "@/config/env.server";
import { HTTPStatus } from "@/constants/httpStatus";
import { authOptions } from "@/lib/authOptions";

/**
 * Proxy autenticado del PDF del contrato de un servicio. Existe porque el
 * backend exige `Authorization: Bearer` en `client/me/services/:id/contract`
 * y un `<a href>` del navegador no puede añadir esa cabecera: el enlace
 * apunta a esta ruta same-origin, que sí recibe la cookie de sesión de
 * NextAuth, resuelve el token server-side y reenvía el binario tal cual.
 * Un 404 (`CONTRACT_NOT_FOUND`, contrato inexistente o todavía en borrador)
 * se propaga tal cual: no hay forma de saber de antemano si existe sin pedirlo.
 * @param {NextRequest} _req - Petición entrante, no usada (el id viaja en la ruta)
 * @param {{params: Promise<{id: string}>}} context - Parámetros de ruta con el id del servicio contratado
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
    `${ENV.BACKEND_URL}/client/me/services/${encodeURIComponent(id)}/contract`,
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
