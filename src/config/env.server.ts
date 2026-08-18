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
};
