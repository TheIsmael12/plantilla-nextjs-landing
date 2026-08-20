"use client";

import { useEffect, useRef } from "react";

import { signOut, useSession } from "next-auth/react";

import { useLocale } from "next-intl";

import { getPortalSessionStatus } from "@/actions/client-portal/sessions-actions";
import {
  AUTH_TOKEN_REFRESH_MARGIN_MS,
  SESSION_HEARTBEAT_INTERVAL_MS,
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
 * **`session.error` ya no cierra la sesión, ni tampoco adelanta la
 * comprobación.** Es un aviso del cliente que no pudo renovar un token, y se
 * probó que aparece incluso con una sesión que la API acaba de emitir y acepta
 * sin problema: cerrar por él echaba a la gente nada más identificarse, y usarlo
 * para preguntar antes de tiempo hacía la pregunta con el token viejo, en la
 * propia pantalla de acceso, y devolvía al login en bucle. Quien decide es el
 * 401, y llega por sí solo en el siguiente latido.
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

  useEffect(() => {
    if (!hasSession) return;

    let cancelled = false;

    /**
     * Le pregunta a la API si la sesión sigue valiendo, y solo entonces cierra.
     *
     * **Un fallo de renovación no cierra la sesión por sí solo.** Antes sí lo hacía, y era la causa de
     * «inicias sesión y te devuelve al principio»: nada más identificarse, una lectura de sesión traía
     * `RefreshAccessTokenError` y el navegador se cerraba la sesión que la API acababa de emitir. Se
     * comprobó midiendo, y el fallo sobrevivía incluso a volver a pedir la sesión al servidor.
     *
     * El cambio es de criterio: `session.error` es **una sospecha del cliente** —no pudo renovar un token,
     * que puede pasar por una carrera entre dos lecturas simultáneas—, mientras que un 401 de
     * `client/me/session-status` es **la respuesta de quien manda**. Solo lo segundo justifica echar a
     * alguien de su pantalla. Si la renovación estaba de verdad rota, el siguiente latido lo confirma con un
     * 401, así que no se pierde la protección: se pierde el falso positivo.
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
      const expiresAt = expiresAtRef.current;
      if (expiresAt && Date.now() >= expiresAt - AUTH_TOKEN_REFRESH_MARGIN_MS) {
        await update();
        return;
      }

      const status = await getPortalSessionStatus();
      if (cancelled || !status.revoked) return;

      await leaveToLogin(locale, "revoked");
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
