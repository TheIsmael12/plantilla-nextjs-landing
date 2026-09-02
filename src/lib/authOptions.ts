import type { JWT } from "next-auth/jwt";
import type { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import {
  completeClientPortalRequiredPasswordChange,
  loginClientPortal,
  refreshClientPortalAccessToken,
  verifyClientPortalTwoFactorChallenge,
} from "@/actions/auth/client-portal-auth";

import { AUTH_COOKIE_NAMES } from "@/config/authCookies";
import { ENV_SERVER as ENV } from "@/config/env.server";
import { AUTH_TOKEN_REFRESH_MARGIN_MS } from "@/config/settings";

import type { PortalLoginActionResult } from "@/types/auth/login";

import { encodeMfaChallenge, encodePasswordChangeRequired } from "@/utils/mfaUtils";

/**
 * Renueva el `accessToken` del `token` si ha caducado o está a punto de
 * hacerlo; si sigue siendo válido, lo devuelve tal cual. Si la renovación
 * falla, conserva los tokens antiguos pero marca `token.error` para que el
 * resto de la app pueda forzar el cierre de sesión en vez de dejar que las
 * siguientes llamadas a la API fallen en silencio con un 401.
 * @param {JWT} token - Token de sesión actual
 * @returns {Promise<JWT>} El mismo token (sin cambios, renovado, o con `error`)
 */
async function ensureFreshAccessToken(token: JWT): Promise<JWT> {
  if (Date.now() < token.accessTokenExpires - AUTH_TOKEN_REFRESH_MARGIN_MS) {
    return token;
  }

  const refreshed = await refreshClientPortalAccessToken(token.backendTokens.refreshToken);

  if (!refreshed) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  return {
    ...token,
    backendTokens: {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
    },
    accessTokenExpires: refreshed.accessTokenExpires,
    error: undefined,
  };
}

/**
 * Traduce el resultado de `actions/auth/client-portal-auth.ts` a lo que
 * `authorize()` debe devolver: un `User` si el login se completó, o una
 * excepción que codifica el paso pendiente (2FA, cambio de contraseña
 * obligatorio) o el motivo del fallo. `signIn(..., { redirect: false })`
 * expone esa excepción tal cual en `response.error`, que `LoginForm`/
 * `PortalMfaVerifyModal` saben interpretar sin llegar a crear una sesión
 * hasta que el paso pendiente se resuelve.
 * @param {PortalLoginActionResult} result - Resultado de `loginClientPortal`/`verifyClientPortalTwoFactorChallenge`/`completeClientPortalRequiredPasswordChange`
 * @returns {User} El cliente autenticado, cuando el login se completó
 * @throws {Error} Con el paso pendiente codificado, o con el mensaje de error de negocio
 */
function resolveAuthorizeResult(result: PortalLoginActionResult): User {
  if (result.status === "success") {
    return {
      id: result.client.id,
      clientPortalAccountId: result.client.clientPortalAccountId,
      clientCode: result.client.clientCode,
      name: result.client.name,
      email: result.client.email,
      phone: result.client.phone,
      preferences: result.client.preferences,
      accessTokenExpires: result.client.accessTokenExpires,
      backendTokens: result.client.backendTokens,
    };
  }

  if (result.status === "mfa_required") {
    throw new Error(encodeMfaChallenge(result.challenge));
  }

  if (result.status === "password_change_required") {
    throw new Error(encodePasswordChangeRequired(result.changeToken));
  }

  throw new Error(result.message);
}

/**
 * Configuración de NextAuth del portal de cliente: proveedor de credenciales
 * que reutiliza un único formulario para los tres pasos del login (CIF/NIF +
 * contraseña, verificación 2FA, cambio de contraseña obligatorio), estrategia
 * de sesión `jwt`, y callbacks que propagan la identidad resuelta (JWT del
 * portal + `GET client/me`) al token/sesión de NextAuth.
 */
export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  secret: ENV.NEXTAUTH_SECRET,
  useSecureCookies: ENV.IS_PRODUCTION,
  pages: {
    signIn: "/login",
  },
  // Los nombres salen de `config/authCookies`: en local llevan delante el de la aplicación, porque el
  // navegador no distingue el puerto y esta y la intranet comparten `localhost`.
  cookies: {
    sessionToken: {
      name: AUTH_COOKIE_NAMES.sessionToken,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: ENV.IS_PRODUCTION,
      },
    },
    callbackUrl: {
      name: AUTH_COOKIE_NAMES.callbackUrl,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: ENV.IS_PRODUCTION,
      },
    },
    csrfToken: {
      name: AUTH_COOKIE_NAMES.csrfToken,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: ENV.IS_PRODUCTION,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        taxId: { label: "taxId", type: "text" },
        password: { label: "password", type: "password" },
        challengeToken: { label: "challengeToken", type: "text" },
        code: { label: "code", type: "text" },
        recoveryCode: { label: "recoveryCode", type: "text" },
        changeToken: { label: "changeToken", type: "text" },
        newPassword: { label: "newPassword", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        if (credentials.changeToken && credentials.newPassword) {
          const result = await completeClientPortalRequiredPasswordChange({
            changeToken: credentials.changeToken,
            newPassword: credentials.newPassword,
          });
          return resolveAuthorizeResult(result);
        }

        if (credentials.challengeToken && (credentials.code || credentials.recoveryCode)) {
          const result = await verifyClientPortalTwoFactorChallenge({
            challengeToken: credentials.challengeToken,
            code: credentials.code || undefined,
            recoveryCode: credentials.recoveryCode || undefined,
          });
          return resolveAuthorizeResult(result);
        }

        if (credentials.taxId && credentials.password) {
          const result = await loginClientPortal({
            taxId: credentials.taxId.trim(),
            password: credentials.password,
          });
          return resolveAuthorizeResult(result);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.clientPortalAccountId = user.clientPortalAccountId;
        token.clientCode = user.clientCode;
        token.name = user.name;
        token.email = user.email;
        token.phone = user.phone;
        token.preferences = user.preferences;
        token.accessTokenExpires = user.accessTokenExpires;
        token.backendTokens = user.backendTokens;
        token.error = undefined;
        return token;
      }

      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return ensureFreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.clientPortalAccountId = token.clientPortalAccountId;
      session.user.clientCode = token.clientCode;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.phone = token.phone;
      session.user.preferences = token.preferences;
      /*
       * La caducidad va a la sesión, y los tokens no.
       *
       * No es un dato sensible —es una marca de tiempo— y es lo que necesita `portalSessionMonitor`
       * para renovar **por el route handler** antes de que caduque: es el único camino que puede escribir
       * la cookie de sesión.
       */
      session.user.accessTokenExpires = token.accessTokenExpires;
      session.user.backendTokens = token.backendTokens;
      session.error = token.error;
      return session;
    },
  },
};
