import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

import type { PortalBackendTokens } from "@/types/auth/login";
import type { PortalPreferences } from "@/types/client-portal/preferences";

/**
 * Augmentación de los tipos de NextAuth para incluir los campos propios del
 * portal de cliente (identidad resuelta tras login/2FA/cambio de
 * contraseña: JWT decodificado + `GET client/me`). Sin esta augmentación,
 * `session.user`/`token` solo tendrían los campos genéricos de NextAuth
 * (`name`, `email`, `image`).
 */
declare module "next-auth" {
  /**
   * Cliente devuelto por `authorize()` y recibido por los callbacks `jwt`/`session`.
   * @interface User
   * @property {string} id - Identificador del cliente, igual a `PortalTokenClaims.clientId`
   * @property {string} clientPortalAccountId - Identificador de la cuenta de acceso al portal
   * @property {string} clientCode - Código de cliente (`CLI-000001`)
   * @property {string} name - Nombre o razón social del cliente
   * @property {string | null} email - Email de contacto del cliente, si tiene uno registrado
   * @property {string | null} phone - Teléfono de contacto del cliente, si tiene uno registrado
   * @property {PortalPreferences | null} preferences - Preferencias guardadas del cliente (tema, idioma, formatos)
   * @property {number} accessTokenExpires - Caducidad de `backendTokens.accessToken` en milisegundos Unix
   * @property {PortalBackendTokens} backendTokens - Tokens de la API asociados a esta sesión
   */
  interface User extends DefaultUser {
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
   * Sesión expuesta a los Server/Client Components vía `useSession()`/`getServerSession()`.
   * @interface Session
   * @property {User} user - Cliente autenticado, con los campos propios de este dominio
   * @property {string} [error] - `"RefreshAccessTokenError"` si la renovación automática del `accessToken` falló (`lib/authOptions.ts`)
   */
  interface Session {
    user: DefaultSession["user"] & User;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Forma persistida del JWT de sesión de NextAuth (cifrado, distinto del
   * `accessToken` de la API): guarda los mismos campos que `User` para no
   * tener que volver a llamar a la API en cada petición.
   * @interface JWT
   * @property {string} id - Identificador del cliente
   * @property {string} clientPortalAccountId - Identificador de la cuenta de acceso al portal
   * @property {string} clientCode - Código de cliente (`CLI-000001`)
   * @property {string} name - Nombre o razón social del cliente
   * @property {string | null} email - Email de contacto del cliente, si tiene uno registrado
   * @property {string | null} phone - Teléfono de contacto del cliente, si tiene uno registrado
   * @property {PortalPreferences | null} preferences - Preferencias guardadas del cliente (tema, idioma, formatos)
   * @property {number} accessTokenExpires - Caducidad de `backendTokens.accessToken` en milisegundos Unix, comprobada en cada invocación del callback `jwt` para saber si toca renovarlo
   * @property {PortalBackendTokens} backendTokens - Tokens de la API asociados a esta sesión
   * @property {string} [error] - `"RefreshAccessTokenError"` si el último intento de renovación falló
   */
  interface JWT extends DefaultJWT {
    id: string;
    clientPortalAccountId: string;
    clientCode: string;
    name: string;
    email: string | null;
    phone: string | null;
    preferences: PortalPreferences | null;
    accessTokenExpires: number;
    backendTokens: PortalBackendTokens;
    error?: string;
  }
}
