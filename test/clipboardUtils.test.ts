import { afterEach, describe, expect, it, vi } from "vitest";

import { copyToClipboard } from "@/utils/clipboardUtils";

/**
 * Sustituye `navigator.clipboard` por uno controlado.
 *
 * Se define sobre `navigator` con `configurable` porque en jsdom la propiedad es de solo lectura: sin esto, la
 * asignación se traga en silencio y la prueba mediría el portapapeles real —que no existe— en vez del doble.
 * @param {{ writeText: () => Promise<void> }} clipboard - El doble
 * @returns {void}
 */
function stubClipboard(clipboard: { writeText: () => Promise<void> }): void {
  Object.defineProperty(navigator, "clipboard", { value: clipboard, configurable: true });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("copyToClipboard", () => {
  it("copia y dice que sí", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });

    await expect(copyToClipboard("INC-000123")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("INC-000123");
  });

  /*
   * Cuando el navegador dice que no, se devuelve `false` en vez de lanzar.
   *
   * Pasa de verdad y por dos motivos corrientes: sin HTTPS el permiso no existe, y en Safari escribir en el
   * portapapeles fuera de un gesto del usuario se rechaza. Quien llama enseña un «copiado» o no lo enseña; que le
   * explote una promesa encima por no poder copiar un código de factura sería desproporcionado.
   */
  it("si el navegador lo rechaza, devuelve false sin lanzar", async () => {
    stubClipboard({ writeText: vi.fn().mockRejectedValue(new Error("NotAllowedError")) });

    await expect(copyToClipboard("texto")).resolves.toBe(false);
  });

  it("copia también una cadena vacía", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });

    await expect(copyToClipboard("")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("");
  });
});
