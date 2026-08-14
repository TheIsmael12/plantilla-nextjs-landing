import { describe, expect, it } from "vitest";

import { formatFileSize } from "@/utils/fileSizeUtils";

describe("formatFileSize", () => {
  /*
   * El cero y los negativos van juntos porque la función los trata igual, y eso es lo correcto: un tamaño
   * negativo no existe, y enseñar «-1 B» en una lista de adjuntos sería peor que enseñar «0 B».
   */
  it.each([0, -1, -1024])("con %i devuelve 0 B", (size) => {
    expect(formatFileSize(size)).toBe("0 B");
  });

  /** Los bytes van **sin decimal**: «512 B» y no «512.0 B», que es ruido en una unidad que ya es exacta. */
  it("los bytes no llevan decimal", () => {
    expect(formatFileSize(1)).toBe("1 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("salta de unidad en cada múltiplo de 1024", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1024 ** 2)).toBe("1.0 MB");
    expect(formatFileSize(1024 ** 3)).toBe("1.0 GB");
  });

  it("redondea a un decimal", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1_500_000)).toBe("1.4 MB");
  });

  /*
   * Por encima de GB no hay unidad, y la función se queda ahí en vez de inventarse un TB.
   *
   * Es el caso que importa de verdad: sin el tope, `UNITS[exponent]` sería `undefined` y el adjunto saldría como
   * «1.0 undefined». Con el tope se lee «1024.0 GB», que es feo pero cierto.
   */
  it("no pasa de GB aunque el tamaño dé para más", () => {
    expect(formatFileSize(1024 ** 4)).toBe("1024.0 GB");
    expect(formatFileSize(1024 ** 5)).toBe("1048576.0 GB");
  });
});
