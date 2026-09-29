import { describe, expect, it, vi } from "vitest";

/*
 * Se dobla NextAuth para que devuelva una sesión **con** `backendTokens`: el callback `session` ya no los
 * pone, pero la ruta los recorta igual como defensa en profundidad, y eso es lo que se comprueba — en los dos
 * verbos, porque `update()` es un `POST /api/auth/session` y antes ese verbo salía sin filtrar.
 */
const sessionWithTokens = {
  user: { id: "c1", name: "Cliente", backendTokens: { accessToken: "a", refreshToken: "r" } },
  expires: "2099-01-01",
};

vi.mock("next-auth", () => ({
  default: () => () =>
    Promise.resolve(
      new Response(JSON.stringify(sessionWithTokens), {
        headers: { "content-type": "application/json", "set-cookie": "s=1; Path=/" },
      }),
    ),
}));

vi.mock("@/lib/authOptions", () => ({ authOptions: {} }));

const { GET, POST } = await import("@/app/api/auth/[...nextauth]/route");

/**
 * Una petición a una ruta de NextAuth, con lo mínimo que lee el handler.
 * @param {string} path - Ruta
 * @returns {never} La petición
 */
const request = (path: string) =>
  ({ nextUrl: new URL(`http://localhost${path}`) }) as never;

const context = { params: Promise.resolve({ nextauth: ["session"] }) };

describe("ruta de NextAuth", () => {
  it.each([
    ["GET", GET],
    ["POST", POST],
  ])("%s /api/auth/session no devuelve los tokens de la API", async (_verb, handler) => {
    const response = await handler(request("/api/auth/session"), context);
    const body = await response.json();

    expect(body.user).not.toHaveProperty("backendTokens");
    expect(body.user.name).toBe("Cliente");
    expect(response.headers.getSetCookie()).toContain("s=1; Path=/");
  });

  it("no toca las respuestas que no son de sesión", async () => {
    const response = await POST(request("/api/auth/callback/credentials"), context);

    expect((await response.json()).user.backendTokens).toBeDefined();
  });
});
