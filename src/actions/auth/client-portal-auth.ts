import { fetchData, fetchDataToken } from "@/actions/fetch";
import { AUTH_REFRESH_GRACE_MS } from "@/config/settings";
import { getPortalRefreshTokenCache } from "@/lib/portalRefreshTokenCache";
import type {
  AuthenticatedPortalClient,
  PortalLoginActionResult,
  PortalLoginCredentials,
  PortalLoginResponseData,
  PortalTokenClaims,
  RefreshedPortalTokens,
} from "@/types/auth/login";
import type { PortalClientMeResponseData } from "@/types/client-portal/profile";
import type { PortalPreferences } from "@/types/client-portal/preferences";
import { decodeJwtPayload } from "@/utils/jwtUtils";

/**
 * Proyecta el `accessToken` (y su `refreshToken` asociado) a la forma que
 * consume `authorize()` de NextAuth. A diferencia de intranet, el JWT del
 * portal no lleva datos de perfil embebidos (solo `clientId`/
 * `clientPortalAccountId`/`jti`/`sid`), así que hace falta encadenar llamadas
 * con el `accessToken` recién emitido (todavía no hay sesión de NextAuth en
 * este punto, de ahí el `token` explícito).
 *
 * Las preferencias viajan en la sesión desde el login, igual que en intranet,
 * para que el tema guardado se aplique en el primer render y no tras un
 * parpadeo; van en paralelo a `client/me` porque son independientes. Un fallo
 * al leerlas no impide entrar: se cae a `null` y la pantalla de preferencias
 * las recarga, mientras que sin `client/me` no hay identidad que mostrar.
 * @param {string} accessToken - JWT emitido por login, 2FA-verify o cambio de contraseña obligatorio
 * @param {string} refreshToken - Token de renovación emitido junto a `accessToken`
 * @returns {Promise<AuthenticatedPortalClient | null>} El cliente autenticado, o `null` si `GET client/me` falló justo tras un login válido
 */
async function toAuthenticatedClient(
  accessToken: string,
  refreshToken: string,
): Promise<AuthenticatedPortalClient | null> {
  const claims = decodeJwtPayload<PortalTokenClaims>(accessToken);

  const [me, preferences] = await Promise.all([
    fetchDataToken<PortalClientMeResponseData, never>("client/me", "GET", undefined, {
      token: accessToken,
    }),
    fetchDataToken<PortalPreferences, never>("client/me/preferences", "GET", undefined, {
      token: accessToken,
    }),
  ]);

  if (!me.data) return null;

  return {
    id: claims.clientId,
    clientPortalAccountId: claims.clientPortalAccountId,
    clientCode: me.data.clientCode,
    name: me.data.name,
    email: me.data.email ?? null,
    phone: me.data.phone ?? null,
    preferences: preferences.data ?? null,
    accessTokenExpires: claims.exp * 1000,
    backendTokens: { accessToken, refreshToken },
  };
}

/**
 * Clasifica la respuesta —común a login, 2FA-verify y cambio de contraseña
 * obligatorio— en el paso que corresponde seguir. El cambio de contraseña
 * tiene prioridad sobre el 2FA si por lo que fuera llegaran ambos indicadores
 * a la vez.
 * @param {PortalLoginResponseData} data - Datos devueltos por la API
 * @returns {Promise<PortalLoginActionResult>} El paso a seguir en el flujo de login
 */
async function resolveLoginOutcome(data: PortalLoginResponseData): Promise<PortalLoginActionResult> {
  if (data.requiresPasswordChange && data.passwordChangeToken) {
    return { status: "password_change_required", changeToken: data.passwordChangeToken };
  }

  if (data.requiresTwoFactor && data.challengeToken) {
    return { status: "mfa_required", challenge: { challengeToken: data.challengeToken } };
  }

  if (data.accessToken && data.refreshToken) {
    const client = await toAuthenticatedClient(data.accessToken, data.refreshToken);
    if (!client) {
      return { status: "error", message: "No se pudieron cargar los datos del cliente." };
    }
    return { status: "success", client };
  }

  return {
    status: "error",
    message: "La API no devolvió ni tokens ni un paso pendiente reconocible.",
  };
}

/**
 * Autentica al cliente contra la API del portal.
 * @param {PortalLoginCredentials} credentials - CIF/NIF y contraseña introducidos en `LoginForm`
 * @returns {Promise<PortalLoginActionResult>} El paso a seguir: sesión creada, 2FA pendiente, cambio de contraseña pendiente, o error
 */
export async function loginClientPortal(
  credentials: PortalLoginCredentials,
): Promise<PortalLoginActionResult> {
  const response = await fetchData<PortalLoginResponseData, PortalLoginCredentials>(
    "client/auth/login",
    "POST",
    credentials,
  );

  if (!response.data) {
    return { status: "error", message: response.message ?? "No se pudo iniciar sesión." };
  }

  return resolveLoginOutcome(response.data);
}

/**
 * Valida el código de verificación en dos pasos (o un código de recuperación)
 * de un login pendiente de 2FA.
 * @param {{ challengeToken: string; code?: string; recoveryCode?: string }} input - Reto pendiente y código introducido
 * @returns {Promise<PortalLoginActionResult>} El paso a seguir tras validar el código
 */
export async function verifyClientPortalTwoFactorChallenge(input: {
  challengeToken: string;
  code?: string;
  recoveryCode?: string;
}): Promise<PortalLoginActionResult> {
  const response = await fetchData<PortalLoginResponseData, typeof input>(
    "client/2fa/verify",
    "POST",
    input,
  );

  if (!response.data) {
    return { status: "error", message: response.message ?? "Código incorrecto." };
  }

  return resolveLoginOutcome(response.data);
}

/**
 * Fija la nueva contraseña de un login pendiente de `requiresPasswordChange`.
 * No requiere sesión: se autentica solo con el `changeToken` recibido en el paso anterior.
 * @param {{ changeToken: string; newPassword: string }} input - Token del cambio pendiente y nueva contraseña elegida
 * @returns {Promise<PortalLoginActionResult>} El paso a seguir tras fijar la nueva contraseña
 */
export async function completeClientPortalRequiredPasswordChange(input: {
  changeToken: string;
  newPassword: string;
}): Promise<PortalLoginActionResult> {
  const response = await fetchData<PortalLoginResponseData, typeof input>(
    "client/auth/change-required-password",
    "POST",
    input,
  );

  if (!response.data) {
    return {
      status: "error",
      message: response.message ?? "No se pudo actualizar la contraseña.",
    };
  }

  return resolveLoginOutcome(response.data);
}

/** Guarda el par rotado durante la ventana de gracia y lo olvida al vencer. */
function rememberRotation(oldRefreshToken: string, rotated: RefreshedPortalTokens): void {
  const { rotated: rotatedRefreshes } = getPortalRefreshTokenCache();

  rotatedRefreshes.set(oldRefreshToken, rotated);

  setTimeout(() => rotatedRefreshes.delete(oldRefreshToken), AUTH_REFRESH_GRACE_MS).unref?.();
}

/**
 * Deduplicada: el backend rota el `refreshToken` en cada uso y revoca toda la
 * sesión si le llega uno ya canjeado. Si el callback `jwt` de NextAuth se
 * dispara varias veces casi a la vez para la misma sesión (varios Server
 * Components montándose en la misma navegación), sin deduplicar cada uno
 * mandaría el mismo `refreshToken` vigente; el backend solo puede honrar el
 * primero, y el resto se leería como reutilización.
 */
async function performRefresh(refreshToken: string): Promise<RefreshedPortalTokens | null> {
  const response = await fetchData<PortalLoginResponseData, { refreshToken: string }>(
    "client/auth/refresh",
    "POST",
    { refreshToken },
  );

  if (!response.data?.accessToken || !response.data.refreshToken) {
    return null;
  }

  const claims = decodeJwtPayload<PortalTokenClaims>(response.data.accessToken);

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    accessTokenExpires: claims.exp * 1000,
  };
}

/**
 * Canjea el `refreshToken` de la sesión por un `accessToken` nuevo cuando el
 * actual ha caducado o está a punto de hacerlo. La llama automáticamente el
 * callback `jwt` de NextAuth (`lib/authOptions.ts`).
 * @param {string} refreshToken - Token de renovación emitido en el login original
 * @returns {Promise<RefreshedPortalTokens | null>} Los tokens renovados, o `null` si la API rechazó el `refreshToken`
 */
export async function refreshClientPortalAccessToken(
  refreshToken: string,
): Promise<RefreshedPortalTokens | null> {
  const cache = getPortalRefreshTokenCache();

  const alreadyRotated = cache.rotated.get(refreshToken);
  if (alreadyRotated) {
    return alreadyRotated;
  }

  const inFlight = cache.pending.get(refreshToken);
  if (inFlight) {
    return inFlight;
  }

  const request = performRefresh(refreshToken)
    .then((result) => {
      if (result) rememberRotation(refreshToken, result);
      return result;
    })
    .finally(() => {
      cache.pending.delete(refreshToken);
    });
  cache.pending.set(refreshToken, request);

  return request;
}

