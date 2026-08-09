"use client";

import type { PropsWithChildren } from "react";

import { SessionProvider } from "next-auth/react";

import { SESSION_REFETCH_INTERVAL_SECONDS } from "@/config/settings";
import { usePortalSessionMonitor } from "@/lib/portalSessionMonitor";
import RealtimeProvider from "@/context/RealtimeProvider";
import ThemePreferenceSync from "@/context/ThemePreferenceSync";

/** Monta `usePortalSessionMonitor` dentro del árbol de `SessionProvider`, que es donde `useSession()` puede llamarse. */
function SessionMonitor() {
    usePortalSessionMonitor();
    return null;
}

/**
 * Envuelve `SessionProvider` de NextAuth en un Client Component: `SessionProvider`
 * usa Context de React, que no está disponible si se importa directamente en el
 * layout raíz (Server Component). También monta el vigilante que cierra la
 * sesión automáticamente si la renovación del `accessToken` falla.
 *
 * `RealtimeProvider` cuelga de aquí, dentro de `SessionProvider`, porque
 * decide si conectar mirando `useSession()`: así la lógica de sesión no se
 * duplica y el socket solo se abre cuando hay una sesión iniciada.
 *
 * `refetchInterval` no está aquí por frescura de datos: `/api/auth/session`
 * es el único punto donde la renovación del `accessToken` llega a escribirse
 * en la cookie de sesión (ver `SESSION_REFETCH_INTERVAL_SECONDS`). Sin ese
 * sondeo, una sesión que solo se lee desde Server Components rotaba el
 * `refreshToken` en el backend sin poder guardar el nuevo, y se cerraba al
 * caducar el token de acceso.
 * @param {PropsWithChildren} props - `children` es el resto del árbol de la app
 * @returns {JSX.Element} El árbol envuelto en el proveedor de sesión
 */
export default function SessionAuthProvider({ children }: PropsWithChildren) {
    return (
        <SessionProvider refetchInterval={SESSION_REFETCH_INTERVAL_SECONDS} refetchOnWindowFocus>
            <SessionMonitor />
            <ThemePreferenceSync />
            <RealtimeProvider>{children}</RealtimeProvider>
        </SessionProvider>
    );
}
