"use client";

import { useEffect } from "react";

import { signOut, useSession } from "next-auth/react";

import { getPortalSessionStatus } from "@/actions/client-portal/sessions-actions";
import { SESSION_HEARTBEAT_INTERVAL_MS } from "@/config/settings";

/**
 * Vigila la sesión del portal y la cierra en cuanto deja de ser válida, en vez
 * de dejar que las siguientes llamadas a la API fallen en silencio con un 401.
 *
 * Dos mecanismos complementarios:
 *
 * 1. **Fallo de renovación**: si `ensureFreshAccessToken` no pudo renovar el
 *    `accessToken` (`session.error === "RefreshAccessTokenError"`, fijado por
 *    el callback `jwt` de `authOptions.ts`).
 *
 * 2. **Latido** contra `client/me/session-status`: la API responde 401 en
 *    cuanto la sesión se revoca. Sin esto, cerrar sesión desde otro
 *    dispositivo —o que un administrador revoque el acceso del cliente desde
 *    el backoffice— cortaba su acceso a la API al instante, pero su navegador
 *    seguía mostrando el área privada hasta que caducaba el token.
 *
 * El latido se dispara además al volver a la pestaña: si el portátil estaba
 * suspendido, la comprobación ocurre al retomarlo y no en el siguiente ciclo.
 *
 * En ambos casos se vuelve a `/` (home pública) y nunca a `/login`: el cliente
 * no debe acabar en una pantalla de acceso sin haberlo pedido. Montado por
 * `SessionAuthProvider` en el layout raíz.
 * @returns {null} No renderiza nada; solo sincroniza los efectos de vigilancia
 */
export function usePortalSessionMonitor(): null {
  const { data: session } = useSession();
  const hasSession = Boolean(session?.user);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      void signOut({ callbackUrl: "/" });
    }
  }, [session?.error]);

  useEffect(() => {
    if (!hasSession) return;

    let cancelled = false;

    const check = async () => {
      const status = await getPortalSessionStatus();
      if (cancelled || !status.revoked) return;

      await signOut({ callbackUrl: "/" });
    };

    const interval = setInterval(() => void check(), SESSION_HEARTBEAT_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [hasSession]);

  return null;
}
