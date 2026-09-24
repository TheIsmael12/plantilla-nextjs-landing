/**
 * Origen ficticio contra el que se resuelve un `callbackUrl` para saber si de verdad es relativo.
 * `.invalid` es un TLD reservado que nunca resuelve, así que no puede coincidir con nada real.
 */
const RELATIVE_URL_BASE = "https://callback.invalid";

/**
 * Valida un `callbackUrl` recibido por query string antes de redirigir a él, para evitar un open
 * redirect: solo se acepta una ruta relativa de este mismo sitio.
 *
 * **Mirar cómo empieza la cadena no basta, y esa era la comprobación que había** (`startsWith('/')`
 * y no `startsWith('//')`, escrita a mano dentro de `LoginForm`). Bastaba `?callbackUrl=/\evil.com`
 * para saltársela: empieza por una sola barra y no por `//`, así que pasaba el filtro, pero el
 * navegador trata la contrabarra como una barra al leer la autoridad de la URL y el destino acaba
 * siendo `https://evil.com`. Con eso, un enlace a nuestro propio dominio de login —el que el cliente
 * reconoce y en el que confía— deja a alguien en una copia de la pantalla del portal controlada por
 * otro, justo después de teclear su contraseña. Los caracteres de control colados en medio
 * (`/\t/evil.com`) hacen lo mismo, porque el navegador los quita antes de interpretar la URL.
 *
 * Así que en vez de inspeccionar el texto se resuelve contra un origen de mentira y se comprueba que
 * el resultado **siga siendo ese origen**: si la cadena consigue apuntar a cualquier otro sitio, deja
 * de ser relativa y se descarta. Se devuelve la forma ya normalizada por el propio parser, no la
 * original, para que no sobreviva nada raro por el camino.
 *
 * Es la misma función que la intranet tiene en su `urlUtils`; están duplicadas porque son dos
 * proyectos separados, no porque una sea distinta de la otra.
 * @param {string | null | undefined} raw - Valor crudo del parámetro `callbackUrl`
 * @returns {string | null} La ruta relativa saneada, o `null` si no es segura/no existe
 */
export function sanitizeCallbackUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (/[\u0000-\u001F\u007F]/.test(raw)) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;

  try {
    const parsed = new URL(raw, RELATIVE_URL_BASE);
    if (parsed.origin !== RELATIVE_URL_BASE) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}
