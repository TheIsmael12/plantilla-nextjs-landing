import { afterEach, describe, expect, it, vi } from "vitest";

import { logAsyncFailure } from "@/utils/asyncUtils";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logAsyncFailure", () => {
  it("devuelve un manejador que escribe el contexto delante", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logAsyncFailure("cargar facturas")(new Error("boom"));

    expect(error).toHaveBeenCalledWith("[cargar facturas]", "Error: boom");
  });

  /*
   * De un `Error` se registra **nombre y mensaje, no el objeto entero**.
   *
   * Es lo que evita volcar la traza y, con ella, lo que venga colgando del error: en un fallo de `fetch`, el
   * `cause` lleva la petición completa con sus cabeceras —y ahí va el `Authorization`—.
   */
  it("de un Error saca el nombre y el mensaje, y nada más", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const boom = new TypeError("Failed to fetch");

    logAsyncFailure("abrir puerta")(boom);

    expect(error).toHaveBeenCalledWith("[abrir puerta]", "TypeError: Failed to fetch");
    expect(error).not.toHaveBeenCalledWith(expect.anything(), boom);
  });

  it("lo que no es un Error se registra tal cual", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logAsyncFailure("algo")("un rechazo con una cadena");
    expect(error).toHaveBeenLastCalledWith("[algo]", "un rechazo con una cadena");

    logAsyncFailure("otra cosa")({ code: 500 });
    expect(error).toHaveBeenLastCalledWith("[otra cosa]", { code: 500 });
  });

  /** El manejador se puede reutilizar: es una función devuelta, no un efecto de un solo uso. */
  it("el manejador sirve para varias llamadas", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handler = logAsyncFailure("reintentos");

    handler(new Error("uno"));
    handler(new Error("dos"));

    expect(error).toHaveBeenCalledTimes(2);
  });
});
