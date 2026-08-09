import { PropsWithChildren } from "react";

import { getServerSession } from "next-auth/next";
import { getLocale } from "next-intl/server";

import { Link, redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/authOptions";
import ImageLogo from "@/components/ui/images/ImageLogo";

import "@/styles/04-components/auth/authLayout.scss";

/**
 * Layout minimalista de las páginas de autenticación del portal de cliente
 * (login, recuperación de acceso, cambio de contraseña): logo enlazando a
 * la home + contenido centrado, sin la `Navbar`/`Footer` completos del
 * sitio público.
 *
 * Con sesión activa, ninguna de estas páginas tiene sentido (un cliente ya
 * logueado no debería poder volver a "iniciar sesión" o "recuperar
 * contraseña"): se redirige directamente a `/private-area`. Esto también cubre
 * `/change-password`, porque mientras ese paso está pendiente `authorize()`
 * nunca llega a completar una sesión real (lanza el `changeToken` como
 * error en vez de devolver un `User`), así que no hay falso positivo.
 * @param {PropsWithChildren} props Contenedor con la página de autenticación a renderizar
 * @returns {Promise<JSX.Element>} El layout de autenticación renderizado
 */
export default async function AuthLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();

  if (session) {
    redirect({ href: "/private-area", locale });
    return null;
  }

  return (
    <div className="auth-layout">
      <Link href="/" className="auth-layout__logo">
        <ImageLogo />
      </Link>
      <main className="auth-layout__content">{children}</main>
    </div>
  );
}
