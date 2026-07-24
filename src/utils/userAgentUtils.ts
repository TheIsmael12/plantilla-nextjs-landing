/** Categoría de dispositivo detectada a partir de la cadena `User-Agent`. */
export type UserAgentDevice = "mobile" | "tablet" | "desktop";

/** Datos extraídos al analizar una cadena `User-Agent`. */
export interface ParsedUserAgent {
  device: UserAgentDevice;
  browser?: string;
  os?: string;
}

/**
 * Determina el tipo de dispositivo (`mobile`/`tablet`/`desktop`) a partir de
 * la cadena `User-Agent`.
 * @param {string} userAgent - Cadena `User-Agent` del navegador
 * @returns {UserAgentDevice} El tipo de dispositivo detectado
 */
function detectDevice(userAgent: string): UserAgentDevice {
  if (/iPad|Tablet(?!.*Mobile)/i.test(userAgent)) return "tablet";
  if (/Mobi|Android(?=.*Mobile)|iPhone|iPod/i.test(userAgent)) return "mobile";
  return "desktop";
}

/**
 * Extrae el nombre del navegador a partir de la cadena `User-Agent`.
 * @param {string} userAgent - Cadena `User-Agent` del navegador
 * @returns {string | undefined} El nombre del navegador, o `undefined` si no se reconoce
 */
function detectBrowser(userAgent: string): string | undefined {
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/OPR\/|Opera/i.test(userAgent)) return "Opera";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/CriOS\//i.test(userAgent)) return "Chrome";
  if (/Chrome\//i.test(userAgent)) return "Chrome";
  if (/Safari\//i.test(userAgent) && /Version\//i.test(userAgent)) return "Safari";
  return undefined;
}

/**
 * Extrae el sistema operativo a partir de la cadena `User-Agent`.
 * @param {string} userAgent - Cadena `User-Agent` del navegador
 * @returns {string | undefined} El nombre del sistema operativo, o `undefined` si no se reconoce
 */
function detectOs(userAgent: string): string | undefined {
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Linux/i.test(userAgent)) return "Linux";
  return undefined;
}

/**
 * Analiza una cadena `User-Agent` y extrae el tipo de dispositivo, el
 * navegador y el sistema operativo.
 * @param {string} [userAgent] - Cadena `User-Agent` del navegador; si se omite, se devuelven valores por defecto
 * @returns {ParsedUserAgent} Los datos extraídos del `User-Agent`
 */
export function parseUserAgent(userAgent?: string): ParsedUserAgent {
  if (!userAgent) {
    return { device: "desktop", browser: undefined, os: undefined };
  }

  return {
    device: detectDevice(userAgent),
    browser: detectBrowser(userAgent),
    os: detectOs(userAgent),
  };
}
