import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Las cabeceras de la petición original, que solo existen dentro de un Server Component. */
const requestHeaders = vi.hoisted(() => ({ value: null as Headers | null }));

vi.mock("next/headers", () => ({
  headers: () =>
    requestHeaders.value
      ? Promise.resolve(requestHeaders.value)
      : Promise.reject(new Error("fuera de contexto de request")),
}));

/** El idioma y las traducciones del servidor. `getLocale` puede fallar fuera de una petición. */
const serverIntl = vi.hoisted(() => ({ locale: "es" as string | null }));

vi.mock("next-intl/server", () => ({
  getLocale: () =>
    serverIntl.locale ? Promise.resolve(serverIntl.locale) : Promise.reject(new Error("sin locale")),
  getTranslations: () => Promise.resolve((key: string) => `Common.Errors.${key}`),
}));

const { buildHeaders, networkError, parseError, parseSuccess, resolveBackendAssetUrl } =
  await import("@/utils/fetchUtils");

beforeEach(() => {
  requestHeaders.value = null;
  serverIntl.locale = "es";
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveBackendAssetUrl", () => {
  it.each([null, undefined, ""])("con %j no devuelve nada", (path) => {
    expect(resolveBackendAssetUrl(path)).toBeNull();
  });

  /** Una URL ya absoluta se deja tal cual: es de un CDN o de otro servicio. */
  it.each(["https://cdn.example.com/x.png", "http://localhost:9000/x.png"])(
    "deja %s como está",
    (url) => {
      expect(resolveBackendAssetUrl(url)).toBe(url);
    },
  );

  /*
   * Una ruta propia se pega al origen del backend, **con una sola barra**.
   *
   * Es el detalle que arregla la comprobación de `startsWith("/")`: sin ella, una ruta ya absoluta produciría
   * `//uploads/x.png` y el navegador lo leería como protocolo relativo, saliéndose del dominio.
   */
  it("pega el origen del backend sin duplicar la barra", () => {
    const conBarra = resolveBackendAssetUrl("/uploads/x.png");
    const sinBarra = resolveBackendAssetUrl("uploads/x.png");

    expect(conBarra).toBe(sinBarra);
    expect(conBarra).not.toContain("//uploads");
    expect(conBarra).toMatch(/\/uploads\/x\.png$/);
  });
});

describe("buildHeaders", () => {
  it("pone el idioma en las dos cabeceras que la API mira", async () => {
    const headers = await buildHeaders();

    expect(headers.get("Accept-Language")).toBe("es");
    expect(headers.get("x-lang")).toBe("es");
  });

  it("conserva las cabeceras base que se le pasan", async () => {
    const headers = await buildHeaders({ "Content-Type": "application/json" });

    expect(headers.get("Content-Type")).toBe("application/json");
  });

  /** Sin contexto de idioma cae al de por defecto en vez de fallar. */
  it("sin locale disponible usa el de por defecto", async () => {
    serverIntl.locale = null;

    expect((await buildHeaders()).get("Accept-Language")).toBe("es");
  });

  /*
   * Reenvía la IP y el agente del visitante, que es lo que hace que el backend registre **al visitante** y no al
   * servidor de Next.
   *
   * Sin esto, todas las peticiones le llegan a la API desde la misma IP —la del servidor— y cualquier límite por
   * IP o registro de auditoría se vuelve inútil.
   */
  it("reenvía la IP, el agente y el referente de la petición original", async () => {
    requestHeaders.value = new Headers({
      "x-forwarded-for": "88.1.2.3",
      "x-real-ip": "88.1.2.3",
      "user-agent": "Mozilla/5.0",
      referer: "https://imora.es/servicios",
      host: "imora.es",
    });

    const headers = await buildHeaders();

    expect(headers.get("x-forwarded-for")).toBe("88.1.2.3");
    expect(headers.get("x-real-ip")).toBe("88.1.2.3");
    expect(headers.get("user-agent")).toBe("Mozilla/5.0");
    expect(headers.get("referer")).toBe("https://imora.es/servicios");
  });

  /** El `host` se reenvía con otro nombre: mandarlo como `Host` rompería el enrutado del backend. */
  it("el host viaja como x-original-host", async () => {
    requestHeaders.value = new Headers({ host: "imora.es" });

    const headers = await buildHeaders();

    expect(headers.get("x-original-host")).toBe("imora.es");
    expect(headers.get("host")).toBeNull();
  });

  it("no reenvía lo que no venía", async () => {
    requestHeaders.value = new Headers({ "user-agent": "Mozilla/5.0" });

    const headers = await buildHeaders();

    expect(headers.get("user-agent")).toBe("Mozilla/5.0");
    expect(headers.get("x-forwarded-for")).toBeNull();
  });

  /*
   * Fuera de una petición **no falla**: se omite el reenvío y se siguen devolviendo las cabeceras de idioma.
   *
   * Pasa al llamar a la API desde un job o desde el arranque, donde `headers()` de Next lanza. Sin el `try`, una
   * tarea programada reventaría por no poder leer una cabecera que no necesita.
   */
  it("sin contexto de petición devuelve las cabeceras igualmente", async () => {
    requestHeaders.value = null;

    const headers = await buildHeaders();

    expect(headers.get("Accept-Language")).toBe("es");
  });
});

describe("networkError", () => {
  it("devuelve status 0 con el mensaje traducido", async () => {
    const result = await networkError(new Error("fetch failed"));

    expect(result).toEqual({ status: 0, message: "Common.Errors.networkError" });
  });

  /*
   * Registra **el nombre y el mensaje, nunca la excepción entera**.
   *
   * El `cause` de un `fetch` fallido lleva la petición completa con sus cabeceras, y ahí va el token de sesión.
   * Volcarlo al log lo deja escrito en el servidor.
   */
  it("no vuelca la excepción entera al log", async () => {
    const error = new TypeError("fetch failed");
    (error as { cause?: unknown }).cause = { headers: { authorization: "Bearer secreto" } };

    await networkError(error);

    expect(console.error).toHaveBeenCalledWith("[networkError]", "TypeError: fetch failed");
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("secreto");
  });

  it("lo que no es un Error se registra como desconocido", async () => {
    await networkError("un rechazo con una cadena");

    expect(console.error).toHaveBeenCalledWith("[networkError]", "Error desconocido");
  });
});

describe("parseError", () => {
  it("usa el detail de un problema RFC 7807", async () => {
    const response = new Response(JSON.stringify({ detail: "Ese código ya existe" }), {
      status: 409,
    });

    await expect(parseError(response)).resolves.toEqual({
      status: 409,
      message: "Ese código ya existe",
      errors: undefined,
    });
  });

  it("cae al title si no hay detail", async () => {
    const response = new Response(JSON.stringify({ title: "Conflicto" }), { status: 409 });

    await expect(parseError(response)).resolves.toMatchObject({ message: "Conflicto" });
  });

  it("conserva los errores por campo, que es lo que coloca cada mensaje en su input", async () => {
    const errors = [{ field: "email", message: "Ya registrado" }];
    const response = new Response(JSON.stringify({ detail: "Datos inválidos", errors }), {
      status: 422,
    });

    await expect(parseError(response)).resolves.toMatchObject({ errors });
  });

  /*
   * Un cuerpo que no es JSON cae al mensaje genérico en vez de lanzar.
   *
   * Es lo que devuelve un proxy o un balanceador cuando el backend está caído: una página de error en HTML con
   * un 502. Sin esta rama, el `JSON.parse` rompería la promesa y el fallo saldría como excepción en el servidor.
   */
  it("un cuerpo que no es JSON cae al mensaje genérico", async () => {
    const response = new Response("<html>502 Bad Gateway</html>", { status: 502 });

    await expect(parseError(response)).resolves.toEqual({
      status: 502,
      message: "Common.Errors.unexpectedError",
    });
  });

  it("un JSON sin detail ni title también cae al genérico", async () => {
    const response = new Response(JSON.stringify({ algo: "otra cosa" }), { status: 500 });

    await expect(parseError(response)).resolves.toMatchObject({
      message: "Common.Errors.unexpectedError",
    });
  });
});

describe("parseSuccess", () => {
  it("devuelve el sobre de la API tal cual", async () => {
    const response = new Response(JSON.stringify({ status: 200, data: { id: "1" } }), {
      status: 200,
    });

    await expect(parseSuccess(response)).resolves.toEqual({ status: 200, data: { id: "1" } });
  });

  /*
   * Un 204 sin cuerpo no es un error: se devuelve sin datos.
   *
   * El cuerpo va como `null` y no como `""`: el constructor de `Response` rechaza cualquier cuerpo con un 204
   * —«null body status»— y lanzaría antes de llegar a la comprobación.
   */
  it("un cuerpo vacío devuelve el estado sin datos", async () => {
    const response = new Response(null, { status: 204 });

    await expect(parseSuccess(response)).resolves.toEqual({ status: 204, data: undefined });
  });

  it("un 2xx con cuerpo que no es JSON cae al genérico y lo registra", async () => {
    const response = new Response("no soy json", { status: 200 });

    await expect(parseSuccess(response)).resolves.toMatchObject({
      status: 200,
      message: "Common.Errors.unexpectedError",
    });
    expect(console.error).toHaveBeenCalled();
  });

  /** Del cuerpo ilegible solo se registran los primeros 200 caracteres: un HTML entero llenaría el log. */
  it("del cuerpo ilegible solo registra un fragmento", async () => {
    const response = new Response("x".repeat(5000), { status: 200 });

    await parseSuccess(response);

    const logged = String(vi.mocked(console.error).mock.calls[0]?.[3] ?? "");
    expect(logged.length).toBeLessThanOrEqual(200);
  });
});
