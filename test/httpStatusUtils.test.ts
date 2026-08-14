import { describe, expect, it } from "vitest";

import { isErrorStatus } from "@/utils/httpStatusUtils";

describe("isErrorStatus", () => {
  /*
   * El `0` es un error, y es el caso que da sentido a la función.
   *
   * Lo pone `networkError` cuando la petición no llegó a salir: no hay código HTTP porque no hubo respuesta. Sin
   * esta rama, un fallo de red se leería como éxito y la pantalla pintaría datos vacíos en vez de un aviso.
   */
  it("el 0 es un fallo de red, no un éxito", () => {
    expect(isErrorStatus(0)).toBe(true);
  });

  it.each([200, 201, 204, 301, 302, 399])("%i no es error", (status) => {
    expect(isErrorStatus(status)).toBe(false);
  });

  it.each([400, 401, 403, 404, 409, 422, 429, 500, 503])("%i sí es error", (status) => {
    expect(isErrorStatus(status)).toBe(true);
  });

  /** La frontera exacta, que es donde se equivoca quien reescriba esto con un `>`. */
  it("el corte está en 400", () => {
    expect(isErrorStatus(399)).toBe(false);
    expect(isErrorStatus(400)).toBe(true);
  });
});
