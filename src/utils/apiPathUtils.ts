/*
 * Construcción segura de rutas de la API.
 *
 * Las acciones montan el endpoint con plantillas (`client/me/incidents/${id}/close`), y los valores
 * interpolados llegan del navegador: son argumentos de una server action o parámetros de la URL. Sin
 * codificar, un `id` con `/` o `?` cambia a qué endpoint se llama; y **codificar no basta**:
 * `encodeURIComponent("..")` es `..`, y el parser de URLs resuelve `client/me/sessions/..` como `client/me`
 * (y `%2e%2e` igual, el estándar lo trata como `..`). Con eso una petición autenticada con el token del
 * cliente podía acabar en otro endpoint distinto del que la acción pretendía.
 *
 * Aquí hay dos capas:
 *
 * - {@link apiPath}: la plantilla que usan las acciones. Codifica cada valor interpolado y **rechaza** los
 *   que no tienen forma de identificador (vacíos, `.`/`..`, con barras, espacios, `%`, caracteres de
 *   control...). En vez de lanzar devuelve {@link INVALID_API_PATH}, para que `fetchData`/`fetchDataToken`
 *   sigan sin lanzar nunca y respondan un 400 normal.
 * - {@link isSafeApiEndpoint}: la red de seguridad de `actions/fetch.ts`, por si alguna ruta se monta sin
 *   `apiPath`. Rechaza cualquier endpoint con un segmento `.`/`..` (también codificado) o absoluto.
 */

/**
 * Lo que devuelve {@link apiPath} cuando un valor no es válido.
 *
 * Empieza por un segmento `..` **a propósito**: así {@link isSafeApiEndpoint} lo rechaza aunque alguien le
 * concatene después una query (`apiPath\`...\` + "?page=2"`), sin tener que acordarse de compararlo.
 */
export const INVALID_API_PATH = "../invalid-api-path";

/**
 * Forma admitida para un valor interpolado: letras y dígitos (Unicode, por los slugs con tilde), y los
 * caracteres no reservados de una URL (`-`, `_`, `.`, `~`). Cubre los UUID de la API, los códigos
 * (`EMP-000001`), los slugs y los tokens en base64url, que es como los genera el backend.
 */
const SAFE_SEGMENT = /^[\p{L}\p{N}._~-]{1,512}$/u;

/**
 * `true` si el valor puede ir como segmento de ruta (o valor de query) de la API.
 * @param {unknown} value - Valor a comprobar (un id, un slug, un token, un idioma...)
 * @returns {boolean} Si es un segmento válido y no es `.`/`..`
 */
export function isSafePathSegment(value: unknown): value is string | number {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "string") return false;
  if (value === "." || value === "..") return false;

  return SAFE_SEGMENT.test(value);
}

/**
 * Plantilla para rutas de la API: codifica cada valor interpolado con `encodeURIComponent` y rechaza los que
 * no pasan {@link isSafePathSegment}.
 *
 * Solo para lo que va **dentro** de la plantilla: una query ya montada con `URLSearchParams` se concatena
 * fuera (`apiPath\`client/me/invoices\` + buildQueryString(query)`), porque codificarla otra vez la rompería.
 * @example apiPath`client/me/incidents/${incidentId}/close`
 * @param {TemplateStringsArray} strings - Partes fijas de la ruta
 * @param {...(string | number)} values - Valores interpolados
 * @returns {string} La ruta con los valores codificados, o {@link INVALID_API_PATH} si alguno no es válido
 */
export function apiPath(strings: TemplateStringsArray, ...values: (string | number)[]): string {
  let path = strings[0];

  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (!isSafePathSegment(value)) return INVALID_API_PATH;

    path += encodeURIComponent(String(value)) + strings[index + 1];
  }

  return path;
}

/**
 * Red de seguridad de `fetchData`/`fetchDataToken`: `false` si el endpoint es absoluto (`/x`, `//host`,
 * `https://...`) o si **tras decodificarlo** alguno de sus segmentos de ruta es `.` o `..`, que el parser de
 * URLs resolvería saliéndose de la ruta que se pretendía.
 * @param {string} endpoint - Ruta relativa de la API, con su query si la lleva
 * @returns {boolean} Si se puede llamar
 */
export function isSafeApiEndpoint(endpoint: string): boolean {
  if (typeof endpoint !== "string" || endpoint.length === 0) return false;

  const path = endpoint.split(/[?#]/, 1)[0];

  if (path.startsWith("/") || path.startsWith("\\") || /^[a-z][a-z\d+\-.]*:/i.test(path)) return false;

  for (const rawSegment of path.split(/[/\\]/)) {
    let segment: string;

    try {
      segment = decodeURIComponent(rawSegment);
    } catch {
      return false;
    }

    if (segment === "." || segment === "..") return false;
  }

  return true;
}
