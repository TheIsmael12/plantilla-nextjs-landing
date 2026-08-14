import { describe, expect, it } from "vitest";

import { parseUserAgent } from "@/utils/userAgentUtils";

/** Cadenas reales, no inventadas: el orden y las palabras de un `User-Agent` son justo lo que se está probando. */
const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const IPAD_SAFARI =
  "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/604.1";
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
const WINDOWS_EDGE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0";
const MAC_FIREFOX =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0";
const LINUX_OPERA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0";
const IPHONE_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.0.0 Mobile/15E148 Safari/604.1";

describe("parseUserAgent", () => {
  /*
   * Sin cadena se responde «escritorio» y no se falla.
   *
   * Es el caso real de una petición sin cabecera, y la lista de dispositivos del perfil tiene que poder pintar
   * esa fila igual: prefiere un dato genérico a una fila rota.
   */
  it("sin User-Agent devuelve escritorio y nada más", () => {
    expect(parseUserAgent()).toEqual({ device: "desktop", browser: undefined, os: undefined });
    expect(parseUserAgent("")).toEqual({ device: "desktop", browser: undefined, os: undefined });
  });

  it.each([
    { name: "iPhone con Safari", ua: IPHONE_SAFARI, device: "mobile", browser: "Safari", os: "iOS" },
    { name: "iPad", ua: IPAD_SAFARI, device: "tablet", browser: "Safari", os: "iOS" },
    { name: "Android con Chrome", ua: ANDROID_CHROME, device: "mobile", browser: "Chrome", os: "Android" },
    { name: "Windows con Edge", ua: WINDOWS_EDGE, device: "desktop", browser: "Edge", os: "Windows" },
    { name: "Mac con Firefox", ua: MAC_FIREFOX, device: "desktop", browser: "Firefox", os: "macOS" },
    { name: "Linux con Opera", ua: LINUX_OPERA, device: "desktop", browser: "Opera", os: "Linux" },
  ])("reconoce un $name", ({ ua, device, browser, os }) => {
    expect(parseUserAgent(ua)).toEqual({ device, browser, os });
  });

  /*
   * Los dos casos donde el orden de las comprobaciones importa, y que se romperían al reordenarlas:
   *
   * - **Edge lleva `Chrome/` en su cadena.** Si `Chrome` se mirara primero, ningún Edge se reconocería nunca.
   * - **Chrome en iOS se llama `CriOS`** y también lleva `Safari/`. Sin mirar `CriOS` antes, saldría como Safari.
   */
  it("Edge no se confunde con Chrome pese a llevarlo en la cadena", () => {
    expect(WINDOWS_EDGE).toContain("Chrome/");
    expect(parseUserAgent(WINDOWS_EDGE).browser).toBe("Edge");
  });

  it("Chrome en iOS (CriOS) no se confunde con Safari", () => {
    expect(IPHONE_CHROME).toContain("Safari/");
    expect(parseUserAgent(IPHONE_CHROME).browser).toBe("Chrome");
  });

  /** Un navegador que no está en la lista se devuelve como desconocido, no se adivina. */
  it("lo que no reconoce lo deja vacío", () => {
    const parsed = parseUserAgent("curl/8.4.0");

    expect(parsed.browser).toBeUndefined();
    expect(parsed.os).toBeUndefined();
    expect(parsed.device).toBe("desktop");
  });
});
