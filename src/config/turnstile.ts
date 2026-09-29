/**
 * Comprobación de la configuración de Cloudflare Turnstile, el captcha de los formularios públicos
 * (contacto, reclamaciones, candidatura).
 *
 * **Fail-closed en producción.** La site key es una `NEXT_PUBLIC_*`: se incrusta en el build, así que si
 * falta al construir el widget no se pinta en ningún formulario y ponerla después en el entorno no cambia
 * nada hasta volver a desplegar. Y el backend en producción **exige** captcha (`CAPTCHA_PROVIDER` no puede
 * ser `none` en `plantilla-nestjs`), de modo que una web sin site key es una web cuyos formularios fallan
 * todos con un error genérico. Mejor que no llegue a publicarse.
 *
 * Para desplegar a propósito sin captcha (un entorno de pruebas cuyo backend tiene `CAPTCHA_PROVIDER=none`)
 * hay que decirlo explícitamente con `NEXT_PUBLIC_TURNSTILE_DISABLED=true`: así no se confunde nunca un
 * olvido con una decisión.
 *
 * Mismo patrón que `checkCompanyIdentity`: devuelve los problemas y quien llama (`next.config.ts`) decide
 * si cortar (producción) o avisar (desarrollo). Recibe el entorno como parámetro para poder probarla.
 * @param {Record<string, string | undefined>} [env] - Variables de entorno; por defecto `process.env`
 * @returns {string[]} Un problema por línea, vacío si la configuración es válida
 */
export function checkTurnstileConfig(
  env: Record<string, string | undefined> = process.env,
): string[] {
  if (isTurnstileDisabled(env.NEXT_PUBLIC_TURNSTILE_DISABLED)) return [];

  if (!env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()) {
    return [
      "Falta NEXT_PUBLIC_TURNSTILE_SITE_KEY: los formularios públicos se quedarían sin captcha y el " +
        "backend los rechazaría. Si es intencionado (backend con CAPTCHA_PROVIDER=none), pon " +
        "NEXT_PUBLIC_TURNSTILE_DISABLED=true.",
    ];
  }

  return [];
}

/**
 * `true` si el captcha se ha desactivado explícitamente. Solo vale `"true"` (sin distinguir mayúsculas):
 * cualquier otro valor, incluido `"1"` o `"yes"`, deja el captcha activo, para que desactivarlo no pueda
 * pasar por accidente.
 * @param {string | undefined} value - Valor de `NEXT_PUBLIC_TURNSTILE_DISABLED`
 * @returns {boolean} Si el captcha está desactivado
 */
export function isTurnstileDisabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}
