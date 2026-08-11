import { PropsWithChildren } from "react";

import { headers } from "next/headers";

import { getServerSession } from "next-auth/next";
import { getLocale } from "next-intl/server";

import { locales } from "@/config/pathnames";
import { redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/authOptions";

/**
 * A dónde volver después de identificarse, sacado de la ruta que se estaba pidiendo.
 *
 * Se lee del header `x-pathname` que pone `proxy.ts`, porque un layout no recibe la URL. Y se le quita el
 * prefijo de idioma si lo trae: lo que se guarda es la ruta ya localizada sin prefijo —`/area-privada/...`—,
 * que es la forma que el router de next-intl sabe empujar tal cual.
 *
 * Devuelve `undefined` cuando no hay nada que recordar: el destino era la portada del área privada, que es
 * a donde va el login por defecto.
 * @returns {Promise<string | undefined>} La ruta a la que volver, o `undefined` si es la de por defecto
 */
async function requestedPath(): Promise<string | undefined> {
  const pathname = (await headers()).get("x-pathname");
  if (!pathname) return undefined;

  const [, first] = pathname.split("/");
  const withoutLocale = (locales as readonly string[]).includes(first)
    ? pathname.slice(first.length + 1) || "/"
    : pathname;

  return withoutLocale === "/" ? undefined : withoutLocale;
}

/**
 * Layout del área privada de cliente: exige sesión activa (sin ella, redirige a `/login`). Solo el guard
 * de sesión: la cabecera visual común (`ClientAreaHeader`) la aporta `private-area/layout.tsx`.
 *
 * Al mandar a login se lleva **la ruta que se pedía** en `callbackUrl`, y `LoginForm` vuelve a ella al
 * terminar. Sin eso, entrar por un enlace a una factura concreta —de un correo, de un marcador— acababa
 * siempre en la portada del área privada, y había que volver a buscar la factura a mano.
 * @param {PropsWithChildren} props Contenedor con la página privada a renderizar
 * @returns {Promise<JSX.Element>} El layout del área de cliente renderizado
 */
export default async function ClientAreaLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();

  if (!session) {
    const callbackUrl = await requestedPath();

    redirect({
      href: callbackUrl ? { pathname: "/login", query: { callbackUrl } } : "/login",
      locale,
    });
    return null;
  }

  return children;
}
