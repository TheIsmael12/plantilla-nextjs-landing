import type { PortalPreferences } from "@/types/client-portal/preferences";

/**
 * Credenciales que se envían a `client/auth/login`, tal y como las espera
 * `PortalLoginDto` de la API: login por CIF/NIF del cliente, no por email.
 * @interface PortalLoginCredentials
 * @property {string} taxId - CIF/NIF del cliente
 * @property {string} password - Contraseña en texto plano, solo viaja server-side hacia la API
 */
export interface PortalLoginCredentials {
  taxId: string;
  password: string;
}

/**
 * Claims decodificados del `accessToken` del portal de cliente
 * (`ClientPortalJwtPayload`, backend). A diferencia del JWT de intranet, NO
 * lleva nombre/email/perfil — solo identifica la cuenta. `iat`/`exp` los
 * añade la librería de firma del backend automáticamente.
 * @interface PortalTokenClaims
 * @property {string} clientId - Identificador del cliente (empresa/persona física)
 * @property {string} clientPortalAccountId - Identificador de la cuenta de acceso al portal
 * @property {string} jti - Identificador único de este token
 * @property {number} iat - Timestamp Unix (segundos) de emisión
 * @property {number} exp - Timestamp Unix (segundos) de expiración
 */
export interface PortalTokenClaims {
  clientId: string;
  clientPortalAccountId: string;
  jti: string;
  iat: number;
  exp: number;
}

/**
 * Tokens emitidos por la API al completar el login (directo, tras 2FA o tras
 * el cambio de contraseña obligatorio).
 * @interface PortalBackendTokens
 * @property {string} accessToken - JWT de corta duración (15 min) para autorizar peticiones a la API
 * @property {string} refreshToken - Token de larga duración (7 días) para renovar `accessToken`
 */
export interface PortalBackendTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Datos que `authorize()` de NextAuth necesita para construir la sesión tras
 * un login, una verificación 2FA o un cambio de contraseña obligatorio
 * completados con éxito. A diferencia de intranet, estos campos NO salen de
 * decodificar el JWT: `clientCode`/`name`/`email`/`phone` requieren una
 * llamada adicional a `GET client/me` (ver `actions/auth/client-portal-auth.ts`).
 * @interface AuthenticatedPortalClient
 * @property {string} id - Identificador del cliente, igual a `PortalTokenClaims.clientId`
 * @property {string} clientPortalAccountId - Identificador de la cuenta de acceso al portal
 * @property {string} clientCode - Código de cliente (`CLI-000001`)
 * @property {string} name - Nombre o razón social del cliente
 * @property {string | null} email - Email de contacto del cliente, si tiene uno registrado
 * @property {string | null} phone - Teléfono de contacto del cliente, si tiene uno registrado
 * @property {PortalPreferences | null} preferences - Preferencias guardadas del cliente (tema, idioma, formatos), o `null` si no se pudieron cargar
 * @property {number} accessTokenExpires - Caducidad de `backendTokens.accessToken` en milisegundos Unix
 * @property {PortalBackendTokens} backendTokens - Tokens de la API asociados a esta sesión
 */
export interface AuthenticatedPortalClient {
  id: string;
  clientPortalAccountId: string;
  clientCode: string;
  name: string;
  email: string | null;
  phone: string | null;
  preferences: PortalPreferences | null;
  accessTokenExpires: number;
  backendTokens: PortalBackendTokens;
}

/**
 * Tokens renovados devueltos por `refreshClientPortalAccessToken()` al
 * canjear un `refreshToken` todavía válido por un nuevo `accessToken`.
 * @interface RefreshedPortalTokens
 * @property {string} accessToken - Nuevo `accessToken` de corta duración
 * @property {string} refreshToken - Nuevo `refreshToken` (rotado junto al `accessToken`)
 * @property {number} accessTokenExpires - Caducidad del nuevo `accessToken` en milisegundos Unix
 */
export interface RefreshedPortalTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
}

/**
 * Reto de verificación en dos pasos devuelto por login/2FA-verify cuando la
 * cuenta tiene 2FA activo: el login no se completa hasta resolver este reto.
 * @interface PortalMfaChallenge
 * @property {string} challengeToken - Token opaco y de corta duración que identifica el intento de login pendiente de verificación
 */
export interface PortalMfaChallenge {
  challengeToken: string;
}

/**
 * Datos que la API devuelve en `POST client/auth/login`,
 * `POST client/2fa/verify` y `POST client/auth/change-required-password` —
 * la misma forma se reutiliza en los tres pasos, con solo el subconjunto de
 * campos relevante presente en cada caso (`PortalLoginResponseDto`).
 * @interface PortalLoginResponseData
 * @property {string} [accessToken] - Presente cuando el paso se completa sin nada pendiente
 * @property {string} [refreshToken] - Presente junto a `accessToken`
 * @property {string} [challengeToken] - Presente cuando `requiresTwoFactor` es `true`
 * @property {boolean} [requiresTwoFactor] - `true` si el login requiere verificación en dos pasos
 * @property {string} [passwordChangeToken] - Presente cuando `requiresPasswordChange` es `true`; se envía como `changeToken` a `POST client/auth/change-required-password`
 * @property {boolean} [requiresPasswordChange] - `true` si el cliente debe fijar una nueva contraseña antes de completar el login
 */
export interface PortalLoginResponseData {
  accessToken?: string;
  refreshToken?: string;
  challengeToken?: string;
  requiresTwoFactor?: boolean;
  passwordChangeToken?: string;
  requiresPasswordChange?: boolean;
}

/**
 * Resultado de `loginClientPortal()`/`verifyClientPortalTwoFactorChallenge()`/
 * `completeClientPortalRequiredPasswordChange()`: el paso pudo completarse
 * (hay un cliente autenticado), queda pendiente un segundo factor, queda
 * pendiente fijar una nueva contraseña, o falló.
 * @typedef {Object} PortalLoginActionResult
 * @property {("success"|"mfa_required"|"password_change_required"|"error")} status - Discriminador de la unión
 */
export type PortalLoginActionResult =
  | { status: "success"; client: AuthenticatedPortalClient }
  | { status: "mfa_required"; challenge: PortalMfaChallenge }
  | { status: "password_change_required"; changeToken: string }
  | { status: "error"; message: string };
