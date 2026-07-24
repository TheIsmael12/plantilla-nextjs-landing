"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { UserPreferences } from "@/context/PreferencesProvider";

/** Sesión de usuario autenticado, tal y como la expone `next-auth/react`. */
export interface Session {
  user?: {
    id?: string;
    username?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    avatarUrl?: string | null;
    permissions?: string[];
    firstName?: string | null;
    lastName?: string | null;
    corporateEmail?: string | null;
    isEmailVerified?: boolean;
    preferences?: UserPreferences;
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
 * Stub local de `next-auth/react`'s `useSession` mientras el proyecto no
 * tiene autenticación real conectada: refleja la `session` recibida por el
 * {@link SessionProvider} más cercano, o "sin sesión" si no hay ninguna.
 * @returns {{data: Session | null, status: "loading" | "authenticated" | "unauthenticated"}} Sesión y su estado
 */
export function useSession(): { data: Session | null; status: "loading" | "authenticated" | "unauthenticated" } {
  return useContext(SessionContext);
}

/**
 * Stub local de `next-auth/react`'s `signOut`: sin backend real que revoque
 * la sesión, se limita a navegar a `callbackUrl` (o a la raíz), igual que
 * haría la implementación real tras cerrar sesión en el servidor.
 * @param {{callbackUrl?: string}} [options] Ruta a la que navegar tras "cerrar sesión"
 * @returns {Promise<void>} Promesa resuelta justo antes de navegar
 */
export async function signOut(options?: { callbackUrl?: string }): Promise<void> {
  if (typeof window !== "undefined") {
    window.location.href = options?.callbackUrl ?? "/";
  }
}

/**
 * Stub local de `next-auth/react`'s `SessionProvider`: sin autenticación
 * real conectada, se limita a exponer `session` (si se recibe) vía
 * contexto para que `useSession()` la refleje — útil para previsualizar
 * estados autenticados en Storybook/tests, no hidrata una sesión real.
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
