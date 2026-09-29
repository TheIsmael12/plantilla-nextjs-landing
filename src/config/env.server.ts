// Nunca debe acabar en un bundle de cliente: `server-only` lo convierte en
// error de compilación en vez de en un fallo silencioso en tiempo de
// ejecución (Next.js lo resuelve internamente; no hace falta añadirlo a
// `package.json`, ver el mismo patrón en `utils/fetchUtils.ts`).
import "server-only";

/**
 * Variables de entorno **solo de servidor**: nunca deben llegar al bundle del
 * cliente, ni por accidente. Están separadas de `config/env.ts` (las
 * `NEXT_PUBLIC_*`, seguras en el navegador) a propósito — la razón es un bug
 * real que causaron mezcladas en un único módulo: `ContactMapSection.tsx`
 * (Server Component) se renderiza como hijo directo de `ContactViewPage.tsx`
 * (`'use client'`), así que Next también empaquetaba este módulo para el
 * cliente; como `API_BASE_URL` no existe ahí (`process.env` en el navegador
 * solo sustituye variables `NEXT_PUBLIC_*`), `requireEnv` lanzaba
 * `Falta la variable de entorno obligatoria "API_BASE_URL"` en cuanto se
 * abría la página de contacto. Con `server-only`, ese mismo error de fondo
 * se detecta en build en vez de reventar en el navegador de un visitante.
 */

/** En producción no hay valores de conveniencia: una variable que falte corta el arranque. */
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Lanza un error de arranque claro cuando falta una variable de entorno
 * obligatoria, en vez de dejar que el fallo aparezca más tarde como un
 * `undefined` difícil de rastrear en NextAuth (sesiones firmadas con un
 * secreto inconsistente, callbacks apuntando a la URL equivocada).
 * @param {string} name - Nombre de la variable de entorno
 * @param {string | undefined} value - Valor leído de `process.env`
 * @param {string} [developmentFallback] - Valor de conveniencia para desarrollo local, nunca usado en producción
 * @returns {string} El valor, garantizado no vacío
 */
function requireEnv(name: string, value: string | undefined, developmentFallback?: string): string {
  const resolved = value || (IS_PRODUCTION ? undefined : developmentFallback);

  if (!resolved) {
    throw new Error(`Falta la variable de entorno obligatoria "${name}".`);
  }

  return resolved;
}

/**
 * Número de proxies de confianza delante de esta app (`TRUSTED_PROXY_HOPS`), para saber qué entrada de
 * `x-forwarded-for` es la del visitante (ver `utils/fetchUtils.ts`). Por defecto 1: un único proxy (Vercel,
 * nginx) que añade la IP real al final. Un valor que no sea un entero entre 1 y 10 corta el arranque:
 * equivocarse aquí es reenviar a la API una IP que ha escrito el visitante, y eso anula su rate limit por IP.
 * @param {string | undefined} value - Valor de `process.env.TRUSTED_PROXY_HOPS`
 * @returns {number} El número de saltos de confianza
 */
function parseTrustedProxyHops(value: string | undefined): number {
  if (value === undefined || value.trim() === "") return 1;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
    throw new Error(`TRUSTED_PROXY_HOPS debe ser un entero entre 1 y 10 (recibido "${value}").`);
  }

  return parsed;
}

/**
 * Cabecera propia del proxy con la IP del visitante (`TRUSTED_IP_HEADER`), en minúsculas; vacía si no se usa.
 * Un nombre que no sea de cabecera HTTP corta el arranque: si no, `headers.get()` lanzaría en cada petición
 * y el reenvío de la IP dejaría de funcionar sin que nada lo avisara.
 * @param {string | undefined} value - Valor de `process.env.TRUSTED_IP_HEADER`
 * @returns {string} El nombre de la cabecera, o `""`
 */
function parseTrustedIpHeader(value: string | undefined): string {
  const name = (value ?? "").trim().toLowerCase();

  if (name && !/^[a-z0-9-]{1,64}$/.test(name)) {
    throw new Error(`TRUSTED_IP_HEADER no es un nombre de cabecera válido (recibido "${value}").`);
  }

  return name;
}

const BACKEND_URL = requireEnv("API_BASE_URL", process.env.API_BASE_URL, "http://localhost:5000/api");

export const ENV_SERVER = {
  IS_PRODUCTION,

  // Backend API (blog, contacto, unsubscribe)
  BACKEND_URL,
  // Origen del backend sin el prefijo `/api`, para resolver a absolutas las
  // URLs relativas que puede devolver la API (p. ej. `coverUrl` del blog en
  // este entorno: `/media/blog/xxx.png` en vez de una URL ya absoluta).
  BACKEND_ORIGIN: BACKEND_URL.replace(/\/api\/?$/, ""),

  // Authentication
  NEXTAUTH_URL: requireEnv("NEXTAUTH_URL", process.env.NEXTAUTH_URL, "http://localhost:3000"),
  NEXTAUTH_SECRET: requireEnv(
    "NEXTAUTH_SECRET",
    process.env.NEXTAUTH_SECRET,
    "desarrollo-local-no-usar-en-produccion",
  ),

  /*
   * IP del visitante (`utils/fetchUtils.ts`).
   *
   * - `TRUSTED_PROXY_HOPS`: cuántos proxies de confianza hay delante; la IP del visitante es la entrada
   *   N-ésima empezando por el final de `x-forwarded-for`. Por defecto 1.
   * - `TRUSTED_IP_HEADER`: si el proxy de delante pone la IP del visitante en una cabecera propia que el
   *   visitante no puede fijar (p. ej. `cf-connecting-ip` detrás de Cloudflare), se lee de ahí en vez de
   *   `x-forwarded-for`. **Solo** debe ponerse si ese proxy sobrescribe siempre la cabecera: si no, la
   *   escribe el visitante. Vacío = no se usa.
   */
  TRUSTED_PROXY_HOPS: parseTrustedProxyHops(process.env.TRUSTED_PROXY_HOPS),
  TRUSTED_IP_HEADER: parseTrustedIpHeader(process.env.TRUSTED_IP_HEADER),
};
