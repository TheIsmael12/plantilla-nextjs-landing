import { describe, expect, it } from "vitest";

import {
  getFileExtension,
  isCsvFile,
  isImageFile,
  isPdfFile,
  isSafeFileUrl,
  isViewableFile,
  parseCsv,
} from "@/utils/fileUtils";

describe("getFileExtension", () => {
  it("devuelve la extensión en mayúsculas", () => {
    expect(getFileExtension("factura.pdf")).toBe("PDF");
    expect(getFileExtension("Datos.CsV")).toBe("CSV");
  });

  it("se queda con la última de un nombre con varios puntos", () => {
    expect(getFileExtension("copia.de.seguridad.tar.gz")).toBe("GZ");
  });

  /*
   * Sin extensión devuelve `FILE`, y esa es la rama que un `split(".").pop()` a secas se come.
   *
   * `"LEEME".split(".").pop()` devuelve `"LEEME"` —el nombre entero—, así que sin la comparación contra `fileName`
   * la interfaz enseñaría un icono con la palabra «LEEME» dentro en vez de un genérico.
   */
  it("un nombre sin extensión devuelve FILE", () => {
    expect(getFileExtension("LEEME")).toBe("FILE");
  });

  it("un nombre vacío devuelve FILE", () => {
    expect(getFileExtension("")).toBe("FILE");
  });
});

describe("los detectores de tipo", () => {
  it("reconoce las imágenes por su familia MIME", () => {
    expect(isImageFile("image/png")).toBe(true);
    expect(isImageFile("image/webp")).toBe(true);
    expect(isImageFile("application/pdf")).toBe(false);
    expect(isImageFile(undefined)).toBe(false);
  });

  it("reconoce el PDF por su tipo exacto", () => {
    expect(isPdfFile("application/pdf")).toBe(true);
    expect(isPdfFile("application/x-pdf")).toBe(false);
    expect(isPdfFile(undefined)).toBe(false);
  });

  /*
   * El CSV se reconoce por tipo **o** por extensión, y hacen falta las dos vías.
   *
   * Windows manda los `.csv` como `application/vnd.ms-excel` y algunos navegadores como `text/plain`, así que
   * fiarse solo del MIME dejaría sin vista previa a la mitad de las descargas.
   */
  it("reconoce el CSV por tipo o por extensión", () => {
    expect(isCsvFile("text/csv")).toBe(true);
    expect(isCsvFile("application/csv")).toBe(true);
    expect(isCsvFile("application/vnd.ms-excel", "vecinos.csv")).toBe(true);
    expect(isCsvFile(undefined, "vecinos.csv")).toBe(true);
    expect(isCsvFile("text/plain", "notas.txt")).toBe(false);
    expect(isCsvFile(undefined, undefined)).toBe(false);
  });

  it("es previsualizable lo que sea imagen, PDF o CSV", () => {
    expect(isViewableFile("image/jpeg")).toBe(true);
    expect(isViewableFile("application/pdf")).toBe(true);
    expect(isViewableFile(undefined, "datos.csv")).toBe(true);
    expect(isViewableFile("application/zip", "adjuntos.zip")).toBe(false);
  });
});

describe("parseCsv", () => {
  it("parte filas y columnas", () => {
    expect(parseCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  /** El punto y coma es el separador que usa Excel en español, así que se detecta solo. */
  it("detecta el punto y coma y el tabulador", () => {
    expect(parseCsv("a;b\n1;2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
    expect(parseCsv("a\tb\n1\t2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("entiende los saltos de línea de Windows", () => {
    expect(parseCsv("a,b\r\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  /*
   * El BOM se quita, y es el fallo clásico de los CSV exportados desde Excel.
   *
   * Sin quitarlo, la primera cabecera se llama `﻿codigo` en vez de `codigo` y ninguna columna casa: el
   * fichero parece bien formado y la importación falla solo en la primera columna.
   */
  it("descarta el BOM del principio", () => {
    const [header] = parseCsv("﻿codigo,nombre\n1,uno");

    expect(header?.[0]).toBe("codigo");
  });

  it("respeta el separador dentro de un campo entrecomillado", () => {
    expect(parseCsv('nombre,direccion\n"Peña, Diego","Calle Serrano, 145"')).toEqual([
      ["nombre", "direccion"],
      ["Peña, Diego", "Calle Serrano, 145"],
    ]);
  });

  it("dos comillas seguidas dentro de un campo son una comilla", () => {
    expect(parseCsv('texto\n"Dijo ""hola"" y se fue"')).toEqual([
      ["texto"],
      ['Dijo "hola" y se fue'],
    ]);
  });

  /*
   * Una comilla **a mitad de campo** es texto, no una cita que se abre.
   *
   * Es el caso escrito en el propio módulo y el que arruina una importación entera: hay exportadores que no
   * escapan las pulgadas, y tomar la comilla de `Monitor 27"` como apertura arrastraría el resto del fichero a
   * una sola celda gigante.
   */
  it("una comilla suelta a mitad de campo no abre una cita", () => {
    expect(parseCsv('producto,precio\nMonitor 27",199\nTeclado,49')).toEqual([
      ["producto", "precio"],
      ['Monitor 27"', "199"],
      ["Teclado", "49"],
    ]);
  });
});

describe("isSafeFileUrl", () => {
  it("acepta http y https", () => {
    expect(isSafeFileUrl("https://api.enovait.es/files/1.pdf")).toBe(true);
    expect(isSafeFileUrl("http://localhost:5000/files/1.pdf")).toBe(true);
  });

  /*
   * Rechaza los esquemas ejecutables, que es para lo que existe la función.
   *
   * La URL de un adjunto viene del servidor y acaba en el `href` de un enlace o en un `src`. Un `javascript:` ahí
   * es ejecución de código en el origen de la aplicación, con la sesión de quien pulsa.
   */
  it.each(["javascript:alert(1)", "JavaScript:alert(1)", "vbscript:msgbox(1)"])(
    "rechaza %s",
    (url) => {
      expect(isSafeFileUrl(url)).toBe(false);
    },
  );

  it("rechaza una URL vacía o de solo espacios", () => {
    // En un `iframe`, `src=""` recarga el propio documento dentro del visor.
    expect(isSafeFileUrl("")).toBe(false);
    expect(isSafeFileUrl("   ")).toBe(false);
  });

  it("acepta rutas relativas propias y rechaza las de protocolo relativo", () => {
    expect(isSafeFileUrl("/api/uploads/1.pdf")).toBe(true);
    // `//evil.com/x` hereda el protocolo y sale del origen: parece relativa y no lo es.
    expect(isSafeFileUrl("//evil.com/x.pdf")).toBe(false);
  });

  /*
   * Una cadena sin esquema **se acepta**, y no es un descuido: se resuelve contra el origen de la página, así que
   * acaba siendo una ruta propia. Está escrito en el contrato de la función («o una ruta relativa»).
   */
  it("una cadena suelta cuenta como ruta relativa y se acepta", () => {
    expect(isSafeFileUrl("no-soy-una-url")).toBe(true);
  });

  /*
   * **`data:` está permitido a propósito, y conviene saber hasta dónde llega eso.**
   *
   * La lista blanca lo incluye junto a `blob:` para poder previsualizar un fichero que el usuario acaba de elegir
   * en local, sin subirlo. El efecto lateral es que un `data:text/html` también pasa el filtro: si el `fileUrl`
   * de un adjunto llegara con eso y se pintara en un `iframe`, se ejecutaría HTML. Los navegadores lo cargan en
   * un origen opaco —no puede leer la sesión ni el almacenamiento de la aplicación—, así que no es una fuga de
   * datos, pero sí sirve para montar una pantalla de suplantación dentro del visor.
   *
   * Se fija aquí como comportamiento conocido y no como fallo: restringir `data:` a `data:image/*` es una
   * decisión de producto —rompería la vista previa de PDF local si alguna la usa— y no se toma desde una prueba.
   */
  it("data: pasa el filtro, incluido data:text/html", () => {
    expect(isSafeFileUrl("data:image/png;base64,iVBORw0KGgo=")).toBe(true);
    expect(isSafeFileUrl("data:text/html,<script>alert(1)</script>")).toBe(true);
  });
});
