import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Se dobla `@/lib/toast` y no la librería de debajo.
 *
 * Es la frontera propia del proyecto: lo que hay que comprobar es **qué se decide llamar** —éxito o error, y con
 * qué texto—, no cómo pinta la librería un aviso en pantalla.
 */
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@/lib/toast", () => ({ toast }));

const { notifyResponse } = await import("@/utils/toastUtils");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("notifyResponse", () => {
  it("con 200 y mensaje, avisa en verde", () => {
    notifyResponse({ status: 200, message: "Guardado" }, "Algo ha ido mal");

    expect(toast.success).toHaveBeenCalledWith("Guardado");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("el 201 también es éxito", () => {
    notifyResponse({ status: 201, message: "Creado" }, "Algo ha ido mal");

    expect(toast.success).toHaveBeenCalledWith("Creado");
  });

  /*
   * Un éxito **sin mensaje no molesta con un aviso vacío**.
   *
   * Pasa con los 200 que solo devuelven datos: sacar un recuadro verde en blanco cada vez que carga una tabla
   * sería ruido constante.
   */
  it("un éxito sin mensaje no saca ningún aviso", () => {
    notifyResponse({ status: 200 }, "Algo ha ido mal");

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("un error enseña el mensaje del servidor, que ya viene traducido", () => {
    notifyResponse({ status: 409, message: "Ese código ya existe" }, "Algo ha ido mal");

    expect(toast.error).toHaveBeenCalledWith("Ese código ya existe");
  });

  it("sin mensaje del servidor cae al texto de reserva", () => {
    notifyResponse({ status: 500 }, "Algo ha ido mal");

    expect(toast.error).toHaveBeenCalledWith("Algo ha ido mal");
  });

  /*
   * El `0` —fallo de red— se trata como error, que es lo que hay que comprobar aquí.
   *
   * No está en la lista de éxitos, así que cae por el otro lado. Sin eso, una petición que no llegó a salir
   * pasaría en silencio y el formulario parecería haberse guardado.
   */
  it("el 0 de fallo de red avisa en rojo", () => {
    notifyResponse({ status: 0, message: "Sin conexión" }, "Algo ha ido mal");

    expect(toast.error).toHaveBeenCalledWith("Sin conexión");
  });

  it.each([204, 301, 400, 401, 404])("el %i no se considera éxito", (status) => {
    notifyResponse({ status }, "Algo ha ido mal");

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
