import type { PortalMfaChallenge } from "@/types/auth/login";

const MFA_CHALLENGE_PREFIX = "MFA_REQUIRED:";
const PASSWORD_CHANGE_REQUIRED_PREFIX = "PASSWORD_CHANGE_REQUIRED:";

/**
 * Codifica un reto MFA como el mensaje de error que `authorize()` de
 * NextAuth lanza cuando el login requiere un segundo factor.
 * `signIn(..., { redirect: false })` expone ese mensaje tal cual en
 * `response.error`, que {@link decodeMfaChallenge} sabe interpretar en el
 * cliente sin completar aún la sesión.
 * @param {PortalMfaChallenge} challenge - Reto MFA devuelto por la API en el login
 * @returns {string} El mensaje a lanzar desde `authorize()`
 */
export function encodeMfaChallenge(challenge: PortalMfaChallenge): string {
  return `${MFA_CHALLENGE_PREFIX}${challenge.challengeToken}`;
}

/**
 * Interpreta el `error` devuelto por `signIn(..., { redirect: false })`: si
 * codifica un reto MFA (ver {@link encodeMfaChallenge}), lo decodifica; en
 * cualquier otro caso (credenciales inválidas, error de red...) devuelve `null`.
 * @param {string | null | undefined} error - Valor de `response.error` tras `signIn`
 * @returns {PortalMfaChallenge | null} El reto MFA decodificado, o `null` si `error` no es un reto MFA
 */
export function decodeMfaChallenge(error?: string | null): PortalMfaChallenge | null {
  if (!error || !error.startsWith(MFA_CHALLENGE_PREFIX)) return null;

  const challengeToken = error.slice(MFA_CHALLENGE_PREFIX.length);
  if (!challengeToken) return null;

  return { challengeToken };
}

/**
 * Codifica el aviso de cambio de contraseña obligatorio como el mensaje de
 * error que `authorize()` de NextAuth lanza cuando el login (o la
 * verificación 2FA) todavía no puede completarse porque el cliente debe
 * fijar antes una nueva contraseña. Misma técnica que {@link encodeMfaChallenge},
 * para un paso distinto del mismo flujo de login.
 * @param {string} changeToken - `passwordChangeToken` devuelto por la API
 * @returns {string} El mensaje a lanzar desde `authorize()`
 */
export function encodePasswordChangeRequired(changeToken: string): string {
  return `${PASSWORD_CHANGE_REQUIRED_PREFIX}${changeToken}`;
}

/**
 * Interpreta el `error` devuelto por `signIn(..., { redirect: false })`: si
 * codifica un aviso de cambio de contraseña obligatorio (ver
 * {@link encodePasswordChangeRequired}), devuelve el `changeToken`; en
 * cualquier otro caso devuelve `null`.
 * @param {string | null | undefined} error - Valor de `response.error` tras `signIn`
 * @returns {string | null} El `changeToken` decodificado, o `null` si `error` no corresponde a este aviso
 */
export function decodePasswordChangeRequired(error?: string | null): string | null {
  if (!error || !error.startsWith(PASSWORD_CHANGE_REQUIRED_PREFIX)) return null;

  const changeToken = error.slice(PASSWORD_CHANGE_REQUIRED_PREFIX.length);
  return changeToken || null;
}
