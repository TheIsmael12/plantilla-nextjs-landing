"use client";

import { useEffect, useRef } from "react";

import { signOut, useSession } from "next-auth/react";

import { useLocale } from "next-intl";

import { getPortalSessionStatus } from "@/actions/client-portal/sessions-actions";
import {
  AUTH_TOKEN_REFRESH_MARGIN_MS,
  SESSION_HEARTBEAT_INTERVAL_MS,
  SESSION_REFRESH_MAX_CONSECUTIVE_FAILURES,
} from "@/config/settings";
import { locales } from "@/config/pathnames";
import { getPathname } from "@/i18n/navigation";

import type { AnyHref } from "@/i18n/navigation";

/** Por qué se cerró la sesión, para poder explicarlo en la pantalla de acceso. */
type SignOutReason = "expired" | "revoked";

/**
 * Las rutas de identificación, que nunca son un destino al que volver.
 *
 * Si el vigilante salta estando ya en una de ellas —pasa con un token viejo y roto guardado en el
 * navegador—, apuntar `callbackUrl` a la ruta actual deja el login apuntándose a sí mismo:
 * `/iniciar-sesion?reason=expired&callbackUrl=/iniciar-sesion`. Y al identificarse, `LoginForm` obedece ese
 * destino y vuelve al login. Eso es el bucle que se veía como «inicias sesión y no entras».
 */
const AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/change-password",
] as const;

/** Si `pathname` (ya localizado y sin prefijo de idioma) es una de las rutas de identificación. */
function isAuthRoute(pathname: string, locale: string): boolean {
  return AUTH_ROUTES.some((route) => {
    const localized = getPathname({ href: route as AnyHref, locale });
    return pathname === localized || pathname.startsWith(`${localized}/`);
  });
}

/**
 * Cierra la sesión y lleva a la pantalla de acceso contando el motivo y con la ruta en la que se estaba.
 *
 * La URL se monta a mano y no con el router porque `signOut` navega el navegador entero: necesita la ruta
 * ya localizada (`/iniciar-sesion` en español), no la canónica que traduciría el router.
 *
 * `callbackUrl` es el nombre que usa NextAuth para «a dónde ir después de cerrar sesión» y el que usa
 * `LoginForm` para «a dónde ir después de entrar». Aquí coinciden a propósito: se sale llevándose el
 * destino y al identificarse se vuelve al sitio exacto.
 * @param {string} locale - Idioma activo, para localizar la ruta de acceso
 * @param {SignOutReason} reason - Qué ha pasado con la sesión
 * @returns {Promise<void>} Resuelve cuando NextAuth ya ha navegado
 */
async function leaveToLogin(locale: string, reason: SignOutReason): Promise<void> {
  const login = getPathname({ href: "/login" as AnyHref, locale });

  const [, first] = window.location.pathname.split("/");
  const current = (locales as readonly string[]).includes(first)
    ? window.location.pathname.slice(first.length + 1) || "/"
    : window.location.pathname;

  /*
   * Estando ya en una pantalla de identificación no hay nada que contar ni a donde volver.
   *
   * Se cierra la sesión igual —es lo que limpia el token roto que hizo saltar esto—, pero sin motivo y sin
   * destino: quien está en el login ya sabe que tiene que identificarse, y decirle que «su sesión ha
   * caducado» justo cuando iba a entrar solo parece un fallo más.
   */
  if (isAuthRoute(current, locale)) {
    await signOut({ callbackUrl: login });
    return;
  }

  const query = new URLSearchParams({ reason });
  // La portada del área privada es el destino por defecto del login: no hace falta recordarla.
  if (current !== "/") query.set("callbackUrl", current);

  await signOut({ callbackUrl: `${login}?${query.toString()}` });
}

/**
 * Vigila la sesión del portal y la cierra en cuanto deja de ser válida, en vez
 * de dejar que las siguientes llamadas a la API fallen en silencio con un 401.
 *
 * **Quien decide es la API, siempre.** El latido pregunta a
 * `client/me/session-status`, que responde 401 en cuanto la sesión deja de
 * valer: es lo que permite que cerrar sesión desde otro dispositivo —o que un
 * administrador revoque el acceso del cliente desde el backoffice— se refleje
 * en la pantalla abierta al momento, y no dentro de quince minutos cuando
 * caduque el token.
 *
 * El latido se adelanta al volver a la pestaña: si el portátil estaba
 * suspendido, la comprobación ocurre al retomarlo y no en el siguiente ciclo.
 *
 * **Un solo fallo de renovación no cierra la sesión.** Un aviso aislado de que no se pudo renovar
 * el token puede ser el falso positivo ya conocido justo tras identificarse —una carrera entre dos
 * lecturas simultáneas, que se probó que aparece incluso con una sesión que la API acaba de emitir
 * y acepta sin problema—, y cerrar por el primero echaba a la gente nada más entrar.
 *
 * **Varios fallos seguidos sí la cierran.** Si `update()` no logra corregir `accessTokenExpires`
 * tras {@link SESSION_REFRESH_MAX_CONSECUTIVE_FAILURES} intentos consecutivos, el `refreshToken` ya
 * no vale de verdad (caducado, revocado, sesión cerrada desde otro sitio) y no hay ningún 401 al que
 * esperar: con el `accessToken` también caducado, `client/me/session-status` nunca se llega a
 * preguntar —cada latido entra en la rama de renovación y sale antes de llegar ahí— y aunque se
 * preguntara, un 401 con el token propio ya vencido se interpreta a propósito como indeterminado, no
 * como revocación (`getPortalSessionStatus`). Sin este contador la sesión se quedaba "congelada":
 * ni se cerraba ni se renovaba, reintentando para siempre un `refreshToken` que nunca va a funcionar.
 *
 * Al cerrar se va a `/login`, no a la portada pública como antes. La idea de
 * entonces era no dejar a nadie en una pantalla de acceso que no había pedido;
 * en la práctica se leía como un fallo —estabas dentro, no tocaste nada y de
 * pronto apareces en la web pública, sin sesión y sin explicación—. Contarlo y
 * ofrecer la vuelta al sitio exacto es más honesto que disimularlo.
 *
 * Montado por `SessionAuthProvider` en el layout raíz.
 * @returns {null} No renderiza nada; solo sincroniza los efectos de vigilancia
 */
export function usePortalSessionMonitor(): null {
  const { data: session, update } = useSession();
  const locale = useLocale();
  const hasSession = Boolean(session?.user);

  /*
   * La caducidad del `accessToken` en una ref, sincronizada por un efecto.
   *
   * Cambia en cada renovación, y leerla del closure del intervalo la dejaría congelada en el valor que
   * tenía al montarse: el latido creería para siempre que el token está a punto de caducar y llamaría a
   * `update()` cada 15 segundos. Escribir una ref durante el render no está permitido, de ahí el efecto.
   */
  const expiresAtRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    expiresAtRef.current = session?.user?.accessTokenExpires;
  }, [session?.user?.accessTokenExpires]);

  /*
   * Cuántos latidos seguidos han intentado renovar el token sin conseguirlo.
   *
   * En una ref y no en estado: no debe provocar un render, solo condicionar la siguiente vuelta del
   * propio intervalo. Se resetea a 0 en cuanto un ciclo no necesita renovar (el token ya está fresco)
   * o la renovación sí corrige `accessTokenExpires` — un fallo aislado no cuenta para nada si el
   * siguiente ciclo va bien.
   */
  const consecutiveRefreshFailuresRef = useRef(0);

  useEffect(() => {
    if (!hasSession) return;

    let cancelled = false;

    /**
     * Le pregunta a la API si la sesión sigue valiendo, y solo entonces cierra.
     *
     * **Un fallo de renovación aislado no cierra la sesión.** Antes cualquier fallo la cerraba, y era
     * la causa de «inicias sesión y te devuelve al principio»: nada más identificarse, una lectura de
     * sesión traía `RefreshAccessTokenError` por una carrera entre dos lecturas simultáneas, y el
     * navegador cerraba la sesión que la API acababa de emitir. Solo tras
     * {@link SESSION_REFRESH_MAX_CONSECUTIVE_FAILURES} fallos seguidos se da por perdida de verdad —
     * ver el porqué en el comentario de la función—, y ahí sí se cierra sin esperar a un 401 que, con
     * el `accessToken` ya caducado, no va a distinguirse de «mi token es simplemente viejo»
     * (`getPortalSessionStatus`).
     */
    const check = async () => {
      /*
       * Primero renovar si toca, y **volver**: el token nuevo se comprueba en el latido siguiente.
       *
       * El callback `jwt` renueva desde cualquier sitio, pero **solo el route handler de NextAuth
       * escribe la cookie de sesión**: una renovación ocurrida en un Server Component o en una Server
       * Action vale para esa petición y se pierde. Sin esto, la sesión del portal se caía **a una vida de
       * `accessToken`** (15 min): cada petición releía el token viejo de la cookie, la caché de rotación
       * devolvía siempre el mismo par ya emitido —así que la API no se llamaba más—, y al caducar ese par
       * el latido recibía el 401 que se lee como revocación. `update()` pasa por el route handler.
       */
      try {
        const expiresAt = expiresAtRef.current;
        if (expiresAt && Date.now() >= expiresAt - AUTH_TOKEN_REFRESH_MARGIN_MS) {
          const updated = await update();
          if (cancelled) return;

          /*
           * Se lee `accessTokenExpires` de lo que `update()` ha devuelto, no de `expiresAtRef`: el ref
           * lo escribe un `useEffect` aparte al re-renderizar con la sesión nueva, y no hay garantía de
           * que ya haya corrido justo cuando esta promesa resuelve — depender de él aquí arriesgaba un
           * falso negativo (dar la renovación por fallida habiéndola conseguido). El valor que devuelve
           * `update()` es la sesión ya actualizada, sin esa carrera.
           */
          const refreshed = (updated?.user?.accessTokenExpires ?? expiresAt) !== expiresAt;
          consecutiveRefreshFailuresRef.current = refreshed
            ? 0
            : consecutiveRefreshFailuresRef.current + 1;

          if (consecutiveRefreshFailuresRef.current >= SESSION_REFRESH_MAX_CONSECUTIVE_FAILURES) {
            await leaveToLogin(locale, "expired");
          }
          return;
        }

        consecutiveRefreshFailuresRef.current = 0;

        const status = await getPortalSessionStatus();
        if (cancelled || !status.revoked) return;

        await leaveToLogin(locale, "revoked");
      } catch (error) {
        /*
         * Un latido que revienta (red caída, `update()` que lanza) no debe dejar la sesión "pillada" en
         * silencio: sin este `catch`, la promesa rechazada no paraba el `setInterval` pero tampoco se veía
         * en ningún sitio, así que un fallo de renovación repetido pasaba por "todo va bien" hasta que se
         * cumplían los 15 minutos de vida del token y aparecía un 401 sin explicación previa.
         */
        if (!cancelled) {
          console.error("[portalSessionMonitor] Fallo comprobando la sesión", error);
        }
      }
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
  }, [hasSession, locale, update]);

  return null;
}
