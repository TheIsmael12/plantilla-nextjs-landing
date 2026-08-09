"use client";

import { createContext, useContext, type ReactNode } from "react";

// Usado ÚNICAMENTE por Storybook (alias `next-auth/react` → este archivo en
// `.storybook/main.ts`): Storybook no puede montar una sesión NextAuth real
// sin un backend detrás, así que las historias de componentes que consumen
// `useSession`/`SessionProvider` siguen necesitando este stub. La app real
// (Next.js en ejecución) ya usa el paquete `next-auth` instalado de verdad
// — `next.config.ts` no redirige este import en producción/desarrollo.

/** Sesión de cliente autenticado, tal y como la expone `next-auth/react` (ver `types/next-auth.d.ts`). */
export interface Session {
  user?: {
    id?: string;
    clientPortalAccountId?: string;
    clientCode?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    image?: string | null;
    accessTokenExpires?: number;
    backendTokens?: { accessToken: string; refreshToken: string };
  };
  expires?: string;
}

type SessionContextValue =
  | { data: Session; status: "authenticated" }
  | { data: null; status: "unauthenticated" };

const UNAUTHENTICATED: SessionContextValue = { data: null, status: "unauthenticated" };

const SessionContext = createContext<SessionContextValue>(UNAUTHENTICATED);

/**
 * Stub local de `next-auth/react`'s `useSession` para Storybook: refleja la
 * `session` recibida por el {@link SessionProvider} más cercano, o "sin
 * sesión" si no hay ninguna.
 * @returns {{data: Session | null, status: "loading" | "authenticated" | "unauthenticated"}} Sesión y su estado
 */
export function useSession(): { data: Session | null; status: "loading" | "authenticated" | "unauthenticated" } {
  return useContext(SessionContext);
}

/**
 * Stub local de `next-auth/react`'s `signOut` para Storybook: sin backend
 * real que revoque la sesión, se limita a navegar a `callbackUrl` (o a la
 * raíz), igual que haría la implementación real tras cerrar sesión en el servidor.
 * @param {{callbackUrl?: string}} [options] Ruta a la que navegar tras "cerrar sesión"
 * @returns {Promise<void>} Promesa resuelta justo antes de navegar
 */
export async function signOut(options?: { callbackUrl?: string }): Promise<void> {
  if (typeof window !== "undefined") {
    window.location.href = options?.callbackUrl ?? "/";
  }
}

/**
 * Stub local de `next-auth/react`'s `signIn` para Storybook: sin backend
 * real que autentique, siempre resuelve como si las credenciales fueran
 * rechazadas — las historias de `LoginForm`/`PortalMfaVerifyModal` no
 * necesitan cubrir el envío real, solo el layout/validación del formulario.
 * @param {string} _provider - Nombre del proveedor (ignorado)
 * @param {Record<string, unknown>} [_options] - Credenciales y opciones (ignoradas)
 * @returns {Promise<{ok: boolean, error?: string}>} Siempre `{ok: false, error: "..."}`
 */
export async function signIn(
  _provider?: string,
  _options?: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string; status?: number; url?: string | null }> {
  return { ok: false, error: "signIn no está disponible en Storybook.", status: 401, url: null };
}

/**
 * Stub local de `next-auth/react`'s `getSession` para Storybook: siempre
 * resuelve `null` (sin sesión), ya que no hay backend real que la sirva.
 * @returns {Promise<Session | null>} Siempre `null`
 */
export async function getSession(): Promise<Session | null> {
  return null;
}

/**
 * Stub local de `next-auth/react`'s `SessionProvider` para Storybook: se
 * limita a exponer `session` (si se recibe) vía contexto para que
 * `useSession()` la refleje — útil para previsualizar estados autenticados
 * en historias, no hidrata una sesión real.
 * @param {{children?: ReactNode, session?: Session | null}} props Contenido hijo y sesión a exponer
 * @returns {ReactNode} El proveedor de contexto renderizado
 */
export function SessionProvider({
  children,
  session,
}: {
  children?: ReactNode;
  session?: Session | null;
}): ReactNode {
  const value: SessionContextValue = session
    ? { data: session, status: "authenticated" }
    : UNAUTHENTICATED;

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
