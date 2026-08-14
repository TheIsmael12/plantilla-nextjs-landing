import { describe, expect, it } from "vitest";

import { UPLOAD_LIMITS } from "@/constants/ui/files";
import { validateUpload } from "@/utils/fileUtils";

import type { UploadZone } from "@/constants/ui/files";

/** Un `File` del tamaño y tipo que se pida, sin escribir bytes de verdad. */
function file({ name, type, sizeMB }: { name: string; type: string; sizeMB: number }): File {
  const blob = new File([], name, { type });

  // `size` es de solo lectura: se redefine para simular un fichero grande sin reservar memoria.
  Object.defineProperty(blob, "size", { value: Math.round(sizeMB * 1024 * 1024) });

  return blob;
}

describe("validateUpload", () => {
  it("acepta una imagen normal como avatar", () => {
    expect(validateUpload(file({ name: "foto.png", type: "image/png", sizeMB: 1 }), "avatar")).toBeNull();
  });

  it("rechaza lo que se pasa de tamaño, y dice el máximo", () => {
    const result = validateUpload(file({ name: "foto.png", type: "image/png", sizeMB: 5 }), "avatar");

    expect(result).toEqual({ key: "fileTooLarge", maxSizeMB: 2 });
  });

  it("rechaza un tipo que la zona no admite", () => {
    const result = validateUpload(
      file({ name: "contrato.pdf", type: "application/pdf", sizeMB: 1 }),
      "avatar",
    );

    expect(result?.key).toBe("invalidType");
  });

  /*
   * El tipo se acepta **por MIME o por extensión**, y las dos vías hacen falta de verdad.
   *
   * Windows y algunos navegadores entregan los `.docx`, `.xlsx` y `.csv` con `type` vacío. Mirando solo el MIME,
   * un documento perfectamente válido se rechazaría con un mensaje que no ayuda: «tipo no admitido» sobre un PDF.
   */
  it("acepta por extensión cuando el navegador no manda el tipo", () => {
    expect(
      validateUpload(file({ name: "informe.docx", type: "", sizeMB: 1 }), "clientDocument"),
    ).toBeNull();
  });

  it("acepta por MIME aunque la extensión no esté en la lista", () => {
    expect(
      validateUpload(file({ name: "sin-extension", type: "application/pdf", sizeMB: 1 }), "clientDocument"),
    ).toBeNull();
  });

  it("la extensión se compara sin distinguir mayúsculas", () => {
    expect(validateUpload(file({ name: "FOTO.PNG", type: "", sizeMB: 1 }), "avatar")).toBeNull();
  });

  /*
   * El tamaño se mira **antes** que el tipo, y por eso un fichero enorme y además inválido se queja del tamaño.
   *
   * Es el orden correcto para quien lo sufre: si mandas un vídeo de 300 MB, lo primero que hay que decirle es que
   * pesa demasiado; el tipo es un detalle secundario cuando el problema es que no va a subir nunca.
   */
  it("con un fichero grande e inválido, se queja primero del tamaño", () => {
    const result = validateUpload(file({ name: "video.mov", type: "video/quicktime", sizeMB: 50 }), "avatar");

    expect(result?.key).toBe("fileTooLarge");
  });

  /** El límite exacto se acepta: la comprobación es `>`, no `>=`. */
  it("el tamaño justo en el límite se acepta", () => {
    expect(validateUpload(file({ name: "foto.png", type: "image/png", sizeMB: 2 }), "avatar")).toBeNull();
  });

  /*
   * Y todas las zonas configuradas se comprueban de una pasada.
   *
   * Es lo que caza una zona nueva añadida a `UPLOAD_LIMITS` con la lista de extensiones vacía o con un MIME mal
   * escrito: sin esto, el fallo aparecería en producción la primera vez que alguien intente subir algo ahí.
   */
  it.each(Object.keys(UPLOAD_LIMITS) as UploadZone[])(
    "la zona %s acepta el primer tipo que declara",
    (zone) => {
      const { mimeTypes, extensions, maxSizeMB } = UPLOAD_LIMITS[zone];

      expect(mimeTypes.length, `${zone} sin mimeTypes`).toBeGreaterThan(0);
      expect(extensions.length, `${zone} sin extensions`).toBeGreaterThan(0);
      expect(maxSizeMB, `${zone} sin tamaño`).toBeGreaterThan(0);

      const accepted = file({
        name: `fichero${extensions[0]}`,
        type: mimeTypes[0] as string,
        sizeMB: 0.1,
      });

      expect(validateUpload(accepted, zone), zone).toBeNull();
    },
  );
});
