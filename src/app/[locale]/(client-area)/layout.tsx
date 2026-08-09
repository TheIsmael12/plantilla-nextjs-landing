import { PropsWithChildren } from "react";

import { getServerSession } from "next-auth/next";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/authOptions";

/**
 * Layout del área privada de cliente: exige sesión activa (sin ella,
 * redirige a `/login`). Solo el guard de sesión: la cabecera visual común
 * (`ClientAreaHeader`) la aporta `private-area/layout.tsx`.
 * @param {PropsWithChildren} props Contenedor con la página privada a renderizar
 * @returns {Promise<JSX.Element>} El layout del área de cliente renderizado
 */
export default async function ClientAreaLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();

  if (!session) {
    redirect({ href: "/login", locale });
    return null;
  }

  return children;
}
