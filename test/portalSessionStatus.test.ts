import { beforeEach, describe, expect, it, vi } from "vitest";

import { HTTPStatus } from "@/constants/httpStatus";

const fetchDataToken = vi.fn();
const getServerSession = vi.fn();

vi.mock("@/actions/fetch", () => ({
  fetchDataToken: (...args: unknown[]) => fetchDataToken(...args),
}));

/*
 * `getServerSession` se dobla porque el 401 se interpreta según **nuestra** caducidad: sin ámbito de
 * petición, el real revienta con «`headers` was called outside a request scope».
 */
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}));

vi.mock("@/lib/authOptions", () => ({ authOptions: {} }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { getPortalSessionStatus } = await import("@/actions/client-portal/sessions-actions");

/** Sesión cuyo `accessToken` todavía debería valer. */
const sesionVigente = { user: { accessTokenExpires: Date.now() + 60_000 } };

/** Sesión cuyo `accessToken` ya caducó. */
const sesionCaducada = { user: { accessTokenExpires: Date.now() - 1_000 } };

describe("getPortalSessionStatus", () => {
  beforeEach(() => {
    fetchDataToken.mockReset();
    getServerSession.mockReset();
    getServerSession.mockResolvedValue(sesionVigente);
  });

  it("pregunta al endpoint del latido del portal", async () => {
    fetchDataToken.mockResolvedValue({ status: HTTPStatus.OK, data: { revoked: false } });

    await getPortalSessionStatus();

    expect(fetchDataToken).toHaveBeenCalledWith("client/me/session-status", "GET");
  });

  it("da la sesión por revocada ante un 401 con el token todavía vigente", async () => {
    // El token debería haber sido aceptado, así que el 401 solo puede ser una revocación.
    fetchDataToken.mockResolvedValue({ status: HTTPStatus.UNAUTHORIZED });

    await expect(getPortalSessionStatus()).resolves.toEqual({ revoked: true });
  });

  /*
   * El caso que cerraba la sesión del portal a los 15 minutos: el `accessToken` caduca, el latido
   * pregunta con él, la API contesta 401 —correctamente— y eso se leía como una revocación. Son dos cosas
   * distintas y solo una justifica echar al cliente de su pantalla.
   */
  it("no la da por revocada si el 401 llega con nuestro token ya caducado", async () => {
    getServerSession.mockResolvedValue(sesionCaducada);
    fetchDataToken.mockResolvedValue({ status: HTTPStatus.UNAUTHORIZED });

    await expect(getPortalSessionStatus()).resolves.toEqual({ revoked: false });
  });

  it("tampoco la da por revocada si ya no hay sesión que consultar", async () => {
    getServerSession.mockResolvedValue(null);
    fetchDataToken.mockResolvedValue({ status: HTTPStatus.UNAUTHORIZED });

    await expect(getPortalSessionStatus()).resolves.toEqual({ revoked: false });
  });

  it("respeta el `revoked` que devuelve la API cuando contesta 200", async () => {
    fetchDataToken.mockResolvedValue({ status: HTTPStatus.OK, data: { revoked: true } });

    await expect(getPortalSessionStatus()).resolves.toEqual({ revoked: true });
  });

  it("no cierra la sesión ante un fallo de otro tipo", async () => {
    fetchDataToken.mockResolvedValue({ status: HTTPStatus.INTERNAL_SERVER_ERROR });

    await expect(getPortalSessionStatus()).resolves.toEqual({ revoked: false });
  });
});
