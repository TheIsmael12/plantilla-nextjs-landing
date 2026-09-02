/**
 * Los nombres de las cookies de NextAuth, en un solo sitio.
 *
 * **Las cookies no distinguen el puerto.** `localhost:4001` y `localhost:4002` son el mismo host para el
 * navegador, así que las dos aplicaciones que corren en local —esta y la intranet— comparten tarro. Con el
 * nombre por defecto (`next-auth.session-token`), entrar en una **pisa la sesión de la otra**: la siguiente
 * petición a la otra recibe una cookie cifrada con un secreto que no es el suyo y revienta con
 * `JWT_SESSION_ERROR: decryption operation failed` en cada carga, hasta volver a entrar — y entonces se
 * rompe la primera. Comprobado descifrando la misma cookie con los dos secretos: abre con el de esta app y
 * falla con el de la intranet.
 *
 * Por eso en desarrollo cada aplicación pone su nombre delante. **En producción no hace falta y no se
 * toca**: cada una vive en su dominio y estas cookies se fijan sin `domain`, así que son de su host y no
 * viajan ni a un subdominio. Cambiar también el nombre de producción solo serviría para echar de la sesión,
 * una vez, a quien la tuviera abierta.
 *
 * Y están aquí, y no escritos en `authOptions.ts`, porque **hay dos sitios que tienen que decir lo mismo**:
 * quien la escribe y quien la lee. Ver el aviso de `proxy.ts` sobre `getToken()` en la intranet: con los dos
 * nombres desalineados la sesión se crea bien y el proxy la trata como inexistente.
 */

/** En producción mandan los prefijos del navegador; en local, el nombre de la aplicación. */
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** Con qué se distingue esta aplicación de la otra que corre en el mismo `localhost`. */
const DEVELOPMENT_NAMESPACE = "portal.";

export const AUTH_COOKIE_NAMES = {
  sessionToken: IS_PRODUCTION
    ? "__Secure-next-auth.session-token"
    : `${DEVELOPMENT_NAMESPACE}next-auth.session-token`,

  callbackUrl: IS_PRODUCTION
    ? "__Secure-next-auth.callback-url"
    : `${DEVELOPMENT_NAMESPACE}next-auth.callback-url`,

  /*
   * El token CSRF necesita `__Host-` (no solo `__Secure-`) para que el navegador exija que la cookie se
   * fije SIN dominio explícito y con `path=/`, evitando que un subdominio comprometido la sobrescriba.
   *
   * Ese prefijo es incompatible con ponerle nada delante, así que en local se namespacea igual que las
   * otras: sin ello, entrar en una aplicación invalida el formulario de login de la otra.
   */
  csrfToken: IS_PRODUCTION
    ? "__Host-next-auth.csrf-token"
    : `${DEVELOPMENT_NAMESPACE}next-auth.csrf-token`,
} as const;
